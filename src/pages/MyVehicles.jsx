import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CarFront, Eye, Images, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react';
import {
  Badge,
  EmptyState,
  ListSkeleton,
  PageHeader,
  cardClass,
  primaryButtonClass,
  smallButtonClass,
  smallDangerButtonClass,
} from '../components/ui.jsx';
import VehicleImage from '../components/VehicleImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { supabase } from '../lib/supabase.js';
import usePageTitle from '../lib/usePageTitle.js';
import { formatDate, formatPrice, removeVehicleImages } from '../lib/vehicles.js';

// Replaces the original client/seller-dashboard.html (which was hard-coded to seller id 1)
export default function MyVehicles() {
  usePageTitle('My vehicles');
  const { user } = useAuth();
  const { confirm, toast } = useFeedback();
  const location = useLocation();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [status, setStatus] = useState('loading');
  const [deletingId, setDeletingId] = useState(null);

  // Show the one-time success message from Post/Edit, then clear it so it does not reappear on refresh
  const flash = location.state?.flash;
  useEffect(() => {
    if (!flash) return;
    toast(flash);
    navigate(location.pathname, { replace: true, state: null });
  }, [flash, location.pathname, navigate, toast]);

  useEffect(() => {
    supabase
      .from('vehicles')
      .select('id, title, price, year, location, type, condition, image_paths, created_at')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load your vehicles:', error);
          setStatus('error');
        } else {
          setVehicles(data);
          setStatus('ready');
        }
      });
  }, [user.id]);

  async function handleDelete(vehicle) {
    const ok = await confirm({
      title: `Delete "${vehicle.title}"?`,
      message: 'The listing, its photos and any messages about it will be permanently removed.',
      confirmLabel: 'Delete listing',
      destructive: true,
    });
    if (!ok) return;
    setDeletingId(vehicle.id);
    const { data, error } = await supabase.from('vehicles').delete().eq('id', vehicle.id).select('id');
    setDeletingId(null);
    if (error || data.length === 0) {
      console.error('Delete failed:', error);
      toast('Could not delete this vehicle. Please try again.', 'error');
      return;
    }
    await removeVehicleImages(vehicle.image_paths);
    setVehicles((current) => current.filter((v) => v.id !== vehicle.id));
    toast(`"${vehicle.title}" was deleted.`);
  }

  const postButton = (
    <Link to="/post" className={primaryButtonClass}>
      <Plus className="h-4 w-4" aria-hidden="true" /> Post vehicle
    </Link>
  );

  return (
    <>
      <PageHeader
        title="My vehicles"
        description="Manage the vehicles you have listed for sale."
        actions={status === 'ready' && vehicles.length > 0 ? postButton : null}
      />

      {status === 'loading' && <ListSkeleton />}

      {status === 'error' && (
        <EmptyState icon={TriangleAlert} title="Could not load your vehicles" text="Please refresh the page to try again." />
      )}

      {status === 'ready' && vehicles.length === 0 && (
        <EmptyState
          icon={CarFront}
          title="You haven't listed any vehicles yet"
          text="Post your first vehicle so buyers can find it."
          action={postButton}
        />
      )}

      {status === 'ready' && vehicles.length > 0 && (
        <ul className="space-y-4">
          {vehicles.map((vehicle) => (
            <li
              key={vehicle.id}
              className={`${cardClass} flex flex-col gap-5 p-4 transition hover:border-gray-300 hover:shadow-card-hover sm:flex-row sm:items-center`}
            >
              <div className="relative shrink-0 overflow-hidden rounded-xl sm:w-44">
                <VehicleImage path={vehicle.image_paths[0]} alt={vehicle.title} className="aspect-[4/3] w-full" />
                {vehicle.image_paths.length > 1 && (
                  <Badge tone="dark" className="absolute bottom-2 right-2">
                    <Images className="h-3.5 w-3.5" aria-hidden="true" /> {vehicle.image_paths.length}
                  </Badge>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{vehicle.type}</Badge>
                  <Badge tone="neutral">{vehicle.condition}</Badge>
                </div>
                <h3 className="mt-2 truncate text-lg font-semibold text-gray-900">{vehicle.title}</h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  {vehicle.year} · {vehicle.location} · Listed {formatDate(vehicle.created_at)}
                </p>
                <p className="mt-2 text-xl font-bold tracking-tight text-gray-900">{formatPrice(vehicle.price)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/vehicles/${vehicle.id}`} className={smallButtonClass}>
                  <Eye className="h-4 w-4" aria-hidden="true" /> View
                </Link>
                <Link to={`/vehicles/${vehicle.id}/edit`} className={smallButtonClass}>
                  <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(vehicle)}
                  disabled={deletingId === vehicle.id}
                  className={smallDangerButtonClass}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {deletingId === vehicle.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
