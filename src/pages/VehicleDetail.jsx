import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CarFront,
  Clock,
  Gauge,
  LogIn,
  MapPin,
  MessageSquare,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import ContactSellerForm from '../components/ContactSellerForm.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import { Badge, Card, EmptyState, Skeleton, primaryButtonClass } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { formatDate, formatPrice } from '../lib/vehicles.js';

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-5" role="status" aria-label="Loading vehicle">
      <div className="space-y-4 lg:col-span-3">
        <Skeleton className="aspect-[16/10] rounded-2xl" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4 lg:col-span-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

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

  const backLink = (
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-gray-500 transition hover:text-gray-900"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to vehicles
    </Link>
  );

  if (status === 'loading') {
    return (
      <>
        <div className="mb-6">{backLink}</div>
        <DetailSkeleton />
      </>
    );
  }
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
    { icon: Calendar, label: 'Year', value: vehicle.year },
    { icon: CarFront, label: 'Type', value: vehicle.type },
    { icon: Gauge, label: 'Condition', value: vehicle.condition },
    { icon: MapPin, label: 'Location', value: vehicle.location },
    { icon: Clock, label: 'Listed', value: formatDate(vehicle.created_at) },
  ];

  return (
    <>
      <div className="mb-6">{backLink}</div>

      <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        {/* Left: gallery, specs, description */}
        <div className="space-y-8 lg:col-span-3">
          <PhotoGallery paths={vehicle.image_paths} title={vehicle.title} />

          <Card className="p-6">
            <h2 className="text-base font-semibold text-gray-900">Key specifications</h2>
            <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-card ring-1 ring-gray-200">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold text-gray-900">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-gray-900">Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{vehicle.description}</p>
          </Card>
        </div>

        {/* Right: price + contact, sticky on large screens */}
        <div className="lg:col-span-2">
          <div className="space-y-6 lg:sticky lg:top-24">
            <Card className="p-6">
              <div className="flex flex-wrap gap-2">
                <Badge tone="brand">{vehicle.type}</Badge>
                <Badge tone="neutral">{vehicle.condition}</Badge>
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{vehicle.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-4 w-4" aria-hidden="true" /> {vehicle.location}
              </p>
              <div className="mt-6 rounded-xl bg-brand-50/60 px-5 py-4 ring-1 ring-inset ring-brand-100">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-700/70">Asking price</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-brand-800">{formatPrice(vehicle.price)}</p>
              </div>
            </Card>

            <Card className="p-6">
              {isOwner ? (
                <>
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                    <BadgeCheck className="h-5 w-5 text-brand-600" aria-hidden="true" /> This is your listing
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">Buyers can contact you from this page.</p>
                  <Link to={`/vehicles/${vehicle.id}/edit`} className={`${primaryButtonClass} mt-5 w-full`}>
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit listing
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                    <MessageSquare className="h-5 w-5 text-brand-600" aria-hidden="true" /> Contact the seller
                  </h2>
                  {user ? (
                    <ContactSellerForm vehicle={vehicle} />
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-gray-500">Log in to send the seller a message.</p>
                      <Link
                        to="/login"
                        state={{ from: location.pathname }}
                        className={`${primaryButtonClass} mt-5 w-full`}
                      >
                        <LogIn className="h-4 w-4" aria-hidden="true" /> Log in to contact
                      </Link>
                    </>
                  )}
                  <p className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    Your message is visible only to this seller and site admins.
                  </p>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
