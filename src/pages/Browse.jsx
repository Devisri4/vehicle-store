import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CarFront, ChevronDown, Search, SearchX, SlidersHorizontal, TriangleAlert, X } from 'lucide-react';
import {
  EmptyState,
  PageHeader,
  VehicleCardSkeleton,
  inputClass,
  secondaryButtonClass,
} from '../components/ui.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import { supabase } from '../lib/supabase.js';
import usePageTitle from '../lib/usePageTitle.js';
import { VEHICLE_TYPES } from '../lib/vehicles.js';

const GRID = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
const PAGE_SIZE = 12;
const COLUMNS = 'id, title, price, year, location, type, condition, image_paths, status, created_at';

const SORTS = {
  newest: { label: 'Newest first', column: 'created_at', ascending: false },
  price_asc: { label: 'Price: low to high', column: 'price', ascending: true },
  price_desc: { label: 'Price: high to low', column: 'price', ascending: false },
  year_desc: { label: 'Year: newest', column: 'year', ascending: false },
};

// Filters live in the URL (?q=&type=&sort=&min=&max=&year=&sold=1) so results can be shared and survive Back.
const DEFAULTS = { q: '', type: 'All', sort: 'newest', min: '', max: '', year: '', sold: '' };

function readFilters(params) {
  const filters = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) filters[key] = params.get(key) ?? DEFAULTS[key];
  if (!SORTS[filters.sort]) filters.sort = DEFAULTS.sort;
  return filters;
}

// Characters that would break PostgREST's or=(...) filter syntax or act as wildcards
const cleanSearch = (text) => text.replace(/[%_,()*"\\]/g, ' ').trim();
const toNumber = (text) => (text === '' || Number.isNaN(Number(text)) ? null : Number(text));

function buildQuery(filters, page) {
  let query = supabase.from('vehicles').select(COLUMNS, { count: 'exact' });
  if (filters.sold !== '1') query = query.eq('status', 'available');
  if (filters.type !== 'All') query = query.eq('type', filters.type);
  const q = cleanSearch(filters.q);
  if (q) query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%`);
  const min = toNumber(filters.min);
  const max = toNumber(filters.max);
  const year = toNumber(filters.year);
  if (min !== null) query = query.gte('price', min);
  if (max !== null) query = query.lte('price', max);
  if (year !== null) query = query.gte('year', year);
  const sort = SORTS[filters.sort];
  const from = page * PAGE_SIZE;
  return query
    .order(sort.column, { ascending: sort.ascending })
    .order('id', { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
}

// Text box that waits until typing pauses before reporting the value (avoids a query per keystroke)
function DebouncedInput({ value, onCommit, delay = 400, ...props }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (draft === value) return undefined;
    const timer = setTimeout(() => onCommit(draft), delay);
    return () => clearTimeout(timer);
  }, [draft, value, onCommit, delay]);
  return <input {...props} value={draft} onChange={(e) => setDraft(e.target.value)} />;
}

// Replaces the original client/dashboard.html (buyer dashboard). Public: no login needed to browse.
export default function Browse() {
  usePageTitle('Browse vehicles');
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const filterKey = params.toString();
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMore, setShowMore] = useState(() => Boolean(filters.min || filters.max || filters.year || filters.sold));
  const requestId = useRef(0);

  const setFilter = useCallback(
    (key, value) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value === '' || value === DEFAULTS[key]) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );
  const commitQuery = useCallback((value) => setFilter('q', value), [setFilter]);
  const commitMin = useCallback((value) => setFilter('min', value), [setFilter]);
  const commitMax = useCallback((value) => setFilter('max', value), [setFilter]);
  const commitYear = useCallback((value) => setFilter('year', value), [setFilter]);

  // First page whenever the filters change; stale responses are ignored
  useEffect(() => {
    const id = ++requestId.current;
    setStatus('loading');
    setPage(0);
    buildQuery(readFilters(new URLSearchParams(filterKey)), 0).then(({ data, count, error }) => {
      if (id !== requestId.current) return;
      if (error) {
        console.error('Failed to load vehicles:', error);
        setStatus('error');
        return;
      }
      setVehicles(data);
      setTotal(count ?? data.length);
      setStatus('ready');
    });
  }, [filterKey]);

  async function loadMore() {
    const id = requestId.current;
    const nextPage = page + 1;
    setLoadingMore(true);
    const { data, error } = await buildQuery(filters, nextPage);
    setLoadingMore(false);
    if (id !== requestId.current) return;
    if (error) {
      console.error('Failed to load more vehicles:', error);
      return;
    }
    setVehicles((current) => [...current, ...data]);
    setPage(nextPage);
  }

  const hasFilters = filterKey !== '' && Object.keys(DEFAULTS).some((key) => filters[key] !== DEFAULTS[key]);
  const clearFilters = () => setParams({}, { replace: true });

  return (
    <>
      <PageHeader title="Available vehicles" description="Explore pre-owned vehicles from trusted sellers." />

      {/* Sticky filter bar sits just below the 4rem navbar */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-gray-200/80 bg-gray-50/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <DebouncedInput
              type="search"
              aria-label="Search vehicles"
              placeholder="Search by name or location"
              className={`${inputClass} pl-10`}
              value={filters.q}
              onCommit={commitQuery}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <select
              aria-label="Filter by type"
              className={`${inputClass} sm:w-40`}
              value={filters.type}
              onChange={(e) => setFilter('type', e.target.value)}
            >
              <option value="All">All types</option>
              {VEHICLE_TYPES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              aria-label="Sort by"
              className={`${inputClass} sm:w-48`}
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
            >
              {Object.entries(SORTS).map(([key, sort]) => (
                <option key={key} value={key}>
                  {sort.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              aria-expanded={showMore}
              className={`${secondaryButtonClass} col-span-2 shrink-0`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> More filters
              <ChevronDown className={`h-4 w-4 transition ${showMore ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {showMore && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
            <DebouncedInput
              type="number"
              min="0"
              inputMode="numeric"
              aria-label="Minimum price"
              placeholder="Min price (₹)"
              className={inputClass}
              value={filters.min}
              onCommit={commitMin}
            />
            <DebouncedInput
              type="number"
              min="0"
              inputMode="numeric"
              aria-label="Maximum price"
              placeholder="Max price (₹)"
              className={inputClass}
              value={filters.max}
              onCommit={commitMax}
            />
            <DebouncedInput
              type="number"
              min="1900"
              inputMode="numeric"
              aria-label="Minimum year"
              placeholder="Year from"
              className={inputClass}
              value={filters.year}
              onCommit={commitYear}
            />
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={filters.sold === '1'}
                onChange={(e) => setFilter('sold', e.target.checked ? '1' : '')}
                className="h-4 w-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600"
              />
              Show sold vehicles
            </label>
          </div>
        )}
      </div>

      {status === 'loading' && (
        <div className={GRID} role="status" aria-label="Loading vehicles">
          {Array.from({ length: 8 }, (_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === 'error' && (
        <EmptyState icon={TriangleAlert} title="Could not load vehicles" text="Please refresh the page to try again." />
      )}

      {status === 'ready' && total === 0 && !hasFilters && (
        <EmptyState icon={CarFront} title="No vehicles listed yet" text="Check back soon for new listings." />
      )}

      {status === 'ready' && total === 0 && hasFilters && (
        <EmptyState
          icon={SearchX}
          title="No vehicles match your filters"
          text="Try a different name, location, type or price range."
          action={
            <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
              <X className="h-4 w-4" aria-hidden="true" /> Clear filters
            </button>
          }
        />
      )}

      {status === 'ready' && total > 0 && (
        <>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500" aria-live="polite">
              <span className="font-semibold text-gray-900">{total}</span> vehicle{total === 1 ? '' : 's'} found
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                <X className="h-4 w-4" aria-hidden="true" /> Clear filters
              </button>
            )}
          </div>
          <div className={GRID}>
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
          {vehicles.length < total && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-sm text-gray-500">
                Showing {vehicles.length} of {total}
              </p>
              <button type="button" onClick={loadMore} disabled={loadingMore} className={secondaryButtonClass}>
                {loadingMore ? 'Loading…' : 'Load more vehicles'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
