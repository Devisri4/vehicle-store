import { useEffect, useState } from 'react';
import { CarFront, Search, TriangleAlert } from 'lucide-react';
import { EmptyState, PageHeader, inputClass } from '../components/ui.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import { supabase } from '../lib/supabase.js';
import { VEHICLE_TYPES } from '../lib/vehicles.js';

// Replaces the original client/dashboard.html (buyer dashboard)
export default function Browse() {
  const [vehicles, setVehicles] = useState([]);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');

  useEffect(() => {
    supabase
      .from('vehicles')
      .select('id, title, price, year, location, type, condition, image_path, created_at')
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

  return (
    <>
      <PageHeader title="Available vehicles" description="Explore pre-owned vehicles from trusted sellers." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            aria-label="Search vehicles"
            placeholder="Search by name or location"
            className={`${inputClass} pl-9`}
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
      </div>

      {status === 'loading' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
                <div className="h-5 w-1/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <EmptyState icon={TriangleAlert} title="Could not load vehicles" text="Please refresh the page to try again." />
      )}

      {status === 'ready' && filtered.length === 0 && (
        <EmptyState
          icon={CarFront}
          title={vehicles.length === 0 ? 'No vehicles listed yet' : 'No vehicles match your search'}
          text={vehicles.length === 0 ? 'Check back soon for new listings.' : 'Try a different name, location or type.'}
        />
      )}

      {status === 'ready' && filtered.length > 0 && (
        <>
          <p className="mb-4 text-sm text-gray-500">
            {filtered.length} vehicle{filtered.length === 1 ? '' : 's'}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
