import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Send, TriangleAlert } from 'lucide-react';
import { EmptyState, ListSkeleton, PageHeader, cardClass, primaryButtonClass } from '../components/ui.jsx';
import VehicleImage from '../components/VehicleImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import usePageTitle from '../lib/usePageTitle.js';
import { formatDate, formatPrice } from '../lib/vehicles.js';

// New page: messages this user has sent to sellers. RLS already lets senders read their own messages.
export default function MyEnquiries() {
  usePageTitle('My enquiries');
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    supabase
      .from('messages')
      .select('id, message, created_at, vehicle:vehicles(id, title, price, location, image_paths)')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load enquiries:', error);
          setStatus('error');
        } else {
          setEnquiries(data);
          setStatus('ready');
        }
      });
  }, [user.id]);

  return (
    <>
      <PageHeader title="My enquiries" description="Messages you have sent to sellers. Replies arrive by email." />

      {status === 'loading' && <ListSkeleton />}

      {status === 'error' && (
        <EmptyState icon={TriangleAlert} title="Could not load your enquiries" text="Please refresh the page to try again." />
      )}

      {status === 'ready' && enquiries.length === 0 && (
        <EmptyState
          icon={Send}
          title="You haven't contacted any sellers yet"
          text="Find a vehicle you like and send the seller a message from its page."
          action={
            <Link to="/dashboard" className={primaryButtonClass}>
              <Search className="h-4 w-4" aria-hidden="true" /> Browse vehicles
            </Link>
          }
        />
      )}

      {status === 'ready' && enquiries.length > 0 && (
        <ul className="space-y-4">
          {enquiries.map((e) => (
            <li key={e.id} className={`${cardClass} flex flex-col gap-5 p-4 sm:flex-row sm:p-5`}>
              <Link
                to={`/vehicles/${e.vehicle.id}`}
                className="shrink-0 overflow-hidden rounded-xl sm:w-44"
                aria-label={`View ${e.vehicle.title}`}
              >
                <VehicleImage
                  path={e.vehicle.image_paths[0]}
                  alt=""
                  className="aspect-[4/3] w-full transition duration-500 hover:scale-105"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <Link
                    to={`/vehicles/${e.vehicle.id}`}
                    className="truncate text-lg font-semibold text-gray-900 hover:text-brand-700"
                  >
                    {e.vehicle.title}
                  </Link>
                  <span className="text-xs text-gray-400 sm:shrink-0">Sent {formatDate(e.created_at)}</span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  {formatPrice(e.vehicle.price)} · {e.vehicle.location}
                </p>
                <p className="mt-3 whitespace-pre-line rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 ring-1 ring-inset ring-gray-100">
                  {e.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
