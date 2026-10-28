import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Mail, TriangleAlert } from 'lucide-react';
import { EmptyState, PageHeader, inputClass } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { formatDate } from '../lib/vehicles.js';

// Replaces the original client/seller-messages.html.
// Only enquiries about this seller's own vehicles are fetched; RLS enforces the same rule.
export default function SellerMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [vehicleId, setVehicleId] = useState('all');

  useEffect(() => {
    supabase
      .from('messages')
      .select('id, sender_name, email, message, created_at, vehicles!inner(id, title, seller_id)')
      .eq('vehicles.seller_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load messages:', error);
          setStatus('error');
        } else {
          setMessages(data);
          setStatus('ready');
        }
      });
  }, [user.id]);

  // One entry per vehicle that has enquiries, for the filter dropdown
  const vehicles = [...new Map(messages.map((m) => [m.vehicles.id, m.vehicles.title])).entries()];
  const filtered = vehicleId === 'all' ? messages : messages.filter((m) => String(m.vehicles.id) === vehicleId);

  return (
    <>
      <PageHeader title="Messages" description="Enquiries from buyers about your vehicles." />

      {status === 'loading' && <p className="py-16 text-center text-sm text-gray-500">Loading messages…</p>}

      {status === 'error' && (
        <EmptyState icon={TriangleAlert} title="Could not load messages" text="Please refresh the page to try again." />
      )}

      {status === 'ready' && messages.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No messages yet"
          text="When buyers contact you about a vehicle, their messages will appear here."
        />
      )}

      {status === 'ready' && messages.length > 0 && (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              {filtered.length} message{filtered.length === 1 ? '' : 's'}
            </p>
            {vehicles.length > 1 && (
              <select
                aria-label="Filter by vehicle"
                className={`${inputClass} sm:w-64`}
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="all">All vehicles</option>
                {vehicles.map(([id, title]) => (
                  <option key={id} value={String(id)}>
                    {title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <ul className="space-y-4">
            {filtered.map((m) => (
              <li key={m.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                      {m.sender_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{m.sender_name}</p>
                      <p className="truncate text-sm text-gray-500">{m.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 sm:shrink-0">{formatDate(m.created_at)}</span>
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  About{' '}
                  <Link to={`/vehicles/${m.vehicles.id}`} className="font-medium text-brand-700 hover:underline">
                    {m.vehicles.title}
                  </Link>
                </p>
                <p className="mt-2 whitespace-pre-line rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                  {m.message}
                </p>

                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.vehicles.title}`)}`}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" /> Reply by email
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
