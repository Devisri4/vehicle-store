import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Mail, TriangleAlert } from 'lucide-react';
import {
  Badge,
  EmptyState,
  PageHeader,
  TableSkeleton,
  cardClass,
  inputClass,
  smallButtonClass,
} from '../components/ui.jsx';
import ConversationThread from '../components/ConversationThread.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { loadReplies } from '../lib/replies.js';
import { supabase } from '../lib/supabase.js';
import usePageTitle from '../lib/usePageTitle.js';
import { formatDate } from '../lib/vehicles.js';

// Replaces the original client/seller-messages.html.
// Only enquiries about this seller's own vehicles are fetched; RLS enforces the same rule.
export default function SellerMessages() {
  usePageTitle('Messages');
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [vehicleId, setVehicleId] = useState('all');
  const [replies, setReplies] = useState({});

  useEffect(() => {
    supabase
      .from('messages')
      .select('id, sender_id, sender_name, email, message, created_at, vehicles!inner(id, title, seller_id)')
      .eq('vehicles.seller_id', user.id)
      .order('created_at', { ascending: false })
      .then(async ({ data, error }) => {
        if (error) {
          console.error('Failed to load messages:', error);
          setStatus('error');
          return;
        }
        setReplies(await loadReplies(data.map((m) => m.id)));
        setMessages(data);
        setStatus('ready');
      });
  }, [user.id]);

  const addReply = (reply) =>
    setReplies((current) => ({ ...current, [reply.message_id]: [...(current[reply.message_id] ?? []), reply] }));

  // One entry per vehicle that has enquiries, for the filter dropdown
  const vehicles = [...new Map(messages.map((m) => [m.vehicles.id, m.vehicles.title])).entries()];
  const filtered = vehicleId === 'all' ? messages : messages.filter((m) => String(m.vehicles.id) === vehicleId);

  return (
    <>
      <PageHeader title="Messages" description="Enquiries from buyers about your vehicles." />

      {status === 'loading' && <TableSkeleton rows={3} />}

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
              <span className="font-semibold text-gray-900">{filtered.length}</span> message
              {filtered.length === 1 ? '' : 's'}
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
              <li key={m.id} className={`${cardClass} p-5 transition hover:border-gray-300 sm:p-6`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-semibold text-white">
                      {m.sender_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{m.sender_name}</p>
                      <p className="truncate text-sm text-gray-500">{m.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 sm:shrink-0">{formatDate(m.created_at)}</span>
                </div>

                <div className="mt-4">
                  <Link to={`/vehicles/${m.vehicles.id}`} className="rounded-md">
                    <Badge tone="brand" className="transition hover:bg-brand-100">
                      About: {m.vehicles.title}
                    </Badge>
                  </Link>
                </div>
                <p className="mt-3 whitespace-pre-line rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 ring-1 ring-inset ring-gray-100">
                  {m.message}
                </p>

                <ConversationThread
                  message={m}
                  replies={replies[m.id]}
                  currentUserId={user.id}
                  onReplySent={addReply}
                />

                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.vehicles.title}`)}`}
                  className={`${smallButtonClass} mt-3`}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" /> Or reply by email
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
