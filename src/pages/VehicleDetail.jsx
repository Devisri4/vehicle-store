import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CarFront, MapPin, MessageSquare, Pencil } from 'lucide-react';
import { EmptyState, primaryButtonClass } from '../components/ui.jsx';
import VehicleImage from '../components/VehicleImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { formatDate, formatPrice } from '../lib/vehicles.js';

// Replaces the original client/vehicle-detail.html
export default function VehicleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [vehicle, setVehicle] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('Failed to load vehicle:', error);
        setVehicle(data ?? null);
        setStatus(data ? 'ready' : 'missing');
      });
  }, [id]);

  if (status === 'loading') return <p className="py-24 text-center text-sm text-gray-500">Loading…</p>;
  if (status === 'missing') {
    return (
      <EmptyState
        icon={CarFront}
        title="Vehicle not found"
        text="It may have been sold or removed."
        action={
          <Link to="/dashboard" className={primaryButtonClass}>
            Browse vehicles
          </Link>
        }
      />
    );
  }

  const isOwner = user?.id === vehicle.seller_id;
  const specs = [
    ['Year', vehicle.year],
    ['Type', vehicle.type],
    ['Condition', vehicle.condition],
    ['Location', vehicle.location],
    ['Listed', formatDate(vehicle.created_at)],
  ];

  return (
    <>
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to vehicles
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <VehicleImage
            path={vehicle.image_path}
            alt={vehicle.title}
            className="aspect-[4/3] w-full rounded-2xl border border-gray-200"
          />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div>
            <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">{vehicle.type}</span>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">{vehicle.title}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" aria-hidden="true" /> {vehicle.location}
            </p>
            <p className="mt-4 text-3xl font-bold text-brand-700">{formatPrice(vehicle.price)}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            {isOwner ? (
              <>
                <p className="text-sm text-gray-600">This is your listing.</p>
                <Link to={`/vehicles/${vehicle.id}/edit`} className={`${primaryButtonClass} mt-4 w-full`}>
                  <Pencil className="h-4 w-4" aria-hidden="true" /> Edit listing
                </Link>
              </>
            ) : (
              <>
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <MessageSquare className="h-5 w-5 text-brand-600" aria-hidden="true" /> Contact the seller
                </h2>
                {user ? (
                  <p className="mt-2 text-sm text-gray-500">Messaging is coming in the next update.</p>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-gray-500">Log in to send the seller a message.</p>
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className={`${primaryButtonClass} mt-4 w-full`}
                    >
                      Log in to contact
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">Description</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{vehicle.description}</p>
      </section>
    </>
  );
}
