import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CarFront, Eye, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { EmptyState, FormMessage, PageHeader, primaryButtonClass } from '../components/ui.jsx';
import VehicleImage from '../components/VehicleImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { formatDate, formatPrice, removeVehicleImages } from '../lib/vehicles.js';

const actionClass =
  'inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50';

// Replaces the original client/seller-dashboard.html (which was hard-coded to seller id 1)
export default function MyVehicles() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [status, setStatus] = useState('loading');
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(
    location.state?.flash ? { type: 'success', text: location.state.flash } : null,
  );

  // Clear the one-time success message so it does not reappear on refresh
  useEffect(() => {
    if (location.state?.flash) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

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
    if (!window.confirm(`Delete "${vehicle.title}"? This cannot be undone.`)) return;
    setDeletingId(vehicle.id);
    const { data, error } = await supabase.from('vehicles').delete().eq('id', vehicle.id).select('id');
    setDeletingId(null);
    if (error || data.length === 0) {
      console.error('Delete failed:', error);
      setMessage({ type: 'error', text: 'Could not delete this vehicle. Please try again.' });
      return;
    }
    await removeVehicleImages(vehicle.image_paths);
    setVehicles((current) => current.filter((v) => v.id !== vehicle.id));
    setMessage({ type: 'success', text: `"${vehicle.title}" was deleted.` });
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

      {message && (
        <div className="mb-6">
          <FormMessage message={message} />
        </div>
      )}

      {status === 'loading' && <p className="py-16 text-center text-sm text-gray-500">Loading your vehicles…</p>}

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
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <VehicleImage
                path={vehicle.image_paths[0]}
                alt={vehicle.title}
                className="aspect-[4/3] w-full rounded-lg sm:w-40"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-gray-900">{vehicle.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {vehicle.year} · {vehicle.type} · {vehicle.condition} · {vehicle.location}
                </p>
                <p className="mt-2 text-lg font-bold text-brand-700">{formatPrice(vehicle.price)}</p>
                <p className="text-xs text-gray-400">Listed {formatDate(vehicle.created_at)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/vehicles/${vehicle.id}`} className={actionClass}>
                  <Eye className="h-4 w-4" aria-hidden="true" /> View
                </Link>
                <Link to={`/vehicles/${vehicle.id}/edit`} className={actionClass}>
                  <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(vehicle)}
                  disabled={deletingId === vehicle.id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
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
