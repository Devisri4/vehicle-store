import { useEffect, useState } from 'react';
import { CarFront, Search, SearchX, TriangleAlert, X } from 'lucide-react';
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

// Replaces the original client/dashboard.html (buyer dashboard)
export default function Browse() {
  usePageTitle('Browse vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');

  useEffect(() => {
    supabase
      .from('vehicles')
      .select('id, title, price, year, location, type, condition, image_paths, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load vehicles:', error);
          setStatus('error');
        } else {
          setVehicles(data);
          setStatus('ready');
        }
      });
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = vehicles.filter(
    (v) => (type === 'All' || v.type === type) && (!q || `${v.title} ${v.location}`.toLowerCase().includes(q)),
  );
  const hasFilters = q !== '' || type !== 'All';

  function clearFilters() {
    setQuery('');
    setType('All');
  }

  return (
    <>
      <PageHeader title="Available vehicles" description="Explore pre-owned vehicles from trusted sellers." />

      {/* Sticky filter bar sits just below the 4rem navbar */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-gray-200/80 bg-gray-50/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              aria-label="Search vehicles"
              placeholder="Search by name or location"
              className={`${inputClass} pl-10`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="Filter by type"
            className={`${inputClass} sm:w-48`}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All types</option>
            {VEHICLE_TYPES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className={`${secondaryButtonClass} shrink-0`}>
              <X className="h-4 w-4" aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
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

      {status === 'ready' && vehicles.length === 0 && (
        <EmptyState icon={CarFront} title="No vehicles listed yet" text="Check back soon for new listings." />
      )}

      {status === 'ready' && vehicles.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No vehicles match your search"
          text="Try a different name, location or vehicle type."
          action={
            <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
              <X className="h-4 w-4" aria-hidden="true" /> Clear filters
            </button>
          }
        />
      )}

      {status === 'ready' && filtered.length > 0 && (
        <>
          <p className="mb-5 text-sm text-gray-500" aria-live="polite">
            <span className="font-semibold text-gray-900">{filtered.length}</span> vehicle
            {filtered.length === 1 ? '' : 's'} found
            {hasFilters && <> of {vehicles.length}</>}
          </p>
          <div className={GRID}>
            {filtered.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
