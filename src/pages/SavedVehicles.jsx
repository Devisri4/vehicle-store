import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, TriangleAlert } from 'lucide-react';
import { EmptyState, PageHeader, VehicleCardSkeleton, primaryButtonClass } from '../components/ui.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { supabase } from '../lib/supabase.js';
import usePageTitle from '../lib/usePageTitle.js';

const GRID = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

// New page: vehicles the user saved with the heart button. RLS returns only their own rows.
export default function SavedVehicles() {
  usePageTitle('Saved vehicles');
  const { user } = useAuth();
  const { isFavorite, ready } = useFavorites();
  const [vehicles, setVehicles] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    supabase
      .from('favorites')
      .select('created_at, vehicle:vehicles(id, title, price, year, location, type, condition, image_paths, status)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load saved vehicles:', error);
          setStatus('error');
          return;
        }
        setVehicles(data.map((row) => row.vehicle).filter(Boolean));
        setStatus('ready');
      });
  }, [user.id]);

  // Un-saving on this page removes the card straight away
  const visible = ready ? vehicles.filter((v) => isFavorite(v.id)) : vehicles;

  return (
    <>
      <PageHeader title="Saved vehicles" description="Vehicles you have saved to look at later." />

      {status === 'loading' && (
        <div className={GRID} role="status" aria-label="Loading saved vehicles">
          {Array.from({ length: 4 }, (_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === 'error' && (
        <EmptyState icon={TriangleAlert} title="Could not load saved vehicles" text="Please refresh the page to try again." />
      )}

      {status === 'ready' && visible.length === 0 && (
        <EmptyState
          icon={Heart}
          title="No saved vehicles yet"
          text="Tap the heart on any vehicle to keep it here."
          action={
            <Link to="/dashboard" className={primaryButtonClass}>
              <Search className="h-4 w-4" aria-hidden="true" /> Browse vehicles
            </Link>
          }
        />
      )}

      {status === 'ready' && visible.length > 0 && (
        <div className={GRID}>
          {visible.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </>
  );
}
