import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CarFront, MessageSquare, Store, Trash2, TriangleAlert, Users } from 'lucide-react';
import {
  Badge,
  EmptyState,
  PageHeader,
  Skeleton,
  TableSkeleton,
  cardClass,
  smallDangerButtonClass,
} from '../components/ui.jsx';
import VehicleImage from '../components/VehicleImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { supabase } from '../lib/supabase.js';
import usePageTitle from '../lib/usePageTitle.js';
import { formatDate, formatPrice, removeVehicleImages } from '../lib/vehicles.js';

const TABS = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'vehicles', label: 'Vehicles', icon: CarFront },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
];

const ROLE_TONES = { admin: 'purple', seller: 'brand', buyer: 'neutral' };

const deleteButtonClass = smallDangerButtonClass;
const thClass = 'px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500';
const tdClass = 'px-5 py-4 text-sm text-gray-700';

// Deletion of user accounts needs the secret key, so it goes through the server function in api/delete-user.js
async function deleteUserAccount(userId) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch('/api/delete-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
    body: JSON.stringify({ userId }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Could not delete this user.');
}

// Replaces the original client/admin.html
export default function AdminPanel() {
  usePageTitle('Admin panel');
  const { user } = useAuth();
  const { confirm, toast } = useFeedback();
  const [tab, setTab] = useState('users');
  const [data, setData] = useState({ users: [], vehicles: [], messages: [] });
  const [status, setStatus] = useState('loading');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const [users, vehicles, messages] = await Promise.all([
      supabase.from('profiles').select('id, name, email, role, created_at').order('created_at', { ascending: false }),
      supabase
        .from('vehicles')
        .select('id, title, price, image_paths, created_at, seller:profiles(name, email)')
        .order('created_at', { ascending: false }),
      supabase
        .from('messages')
        .select('id, sender_name, email, message, created_at, vehicle:vehicles(id, title)')
        .order('created_at', { ascending: false }),
    ]);
    const error = users.error || vehicles.error || messages.error;
    if (error) {
      console.error('Failed to load admin data:', error);
      setStatus('error');
      return;
    }
    setData({ users: users.data, vehicles: vehicles.data, messages: messages.data });
    setStatus('ready');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteUser(target) {
    const ok = await confirm({
      title: `Delete ${target.name}?`,
      message: `${target.email}\n\nTheir account, vehicles, photos and messages will be permanently removed.`,
      confirmLabel: 'Delete user',
      destructive: true,
    });
    if (!ok) return;
    setBusyId(target.id);
    try {
      await deleteUserAccount(target.id);
      toast(`${target.name} was deleted.`);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteVehicle(vehicle) {
    const ok = await confirm({
      title: `Delete "${vehicle.title}"?`,
      message: 'The listing, its photos and any messages about it will be permanently removed.',
      confirmLabel: 'Delete listing',
      destructive: true,
    });
    if (!ok) return;
    setBusyId(vehicle.id);
    const { data: deleted, error } = await supabase.from('vehicles').delete().eq('id', vehicle.id).select('id');
    if (error || deleted.length === 0) {
      console.error('Delete failed:', error);
      toast('Could not delete this vehicle. Please try again.', 'error');
    } else {
      await removeVehicleImages(vehicle.image_paths);
      toast(`"${vehicle.title}" was deleted.`);
      await load();
    }
    setBusyId(null);
  }

  const counts = { users: data.users.length, vehicles: data.vehicles.length, messages: data.messages.length };
  const stats = [
    { label: 'Users', value: counts.users, icon: Users },
    { label: 'Sellers', value: data.users.filter((u) => u.role === 'seller').length, icon: Store },
    { label: 'Active listings', value: counts.vehicles, icon: CarFront },
    { label: 'Messages', value: counts.messages, icon: MessageSquare },
  ];

  return (
    <>
      <PageHeader title="Admin panel" description="Manage all users, vehicle listings and messages." />

      {status === 'loading' && (
        <div className="space-y-8" role="status" aria-label="Loading">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <TableSkeleton />
        </div>
      )}

      {status === 'error' && (
        <EmptyState icon={TriangleAlert} title="Could not load admin data" text="Please refresh the page to try again." />
      )}

      {status === 'ready' && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className={`${cardClass} flex items-center justify-between p-5`}>
                <div>
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            ))}
          </div>

          <div className="mb-6 flex gap-1 border-b border-gray-200" role="tablist">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                  tab === key
                    ? 'border-brand-700 text-brand-700'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {label} <span className="ml-1 text-xs text-gray-400">{counts[key]}</span>
              </button>
            ))}
          </div>

          <div className={`${cardClass} overflow-x-auto`}>
            {tab === 'users' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Role</th>
                    <th className={thClass}>Joined</th>
                    <th className={thClass}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.users.map((u) => (
                    <tr key={u.id}>
                      <td className={`${tdClass} font-medium text-gray-900`}>
                        {u.name}
                        {u.id === user.id && <span className="ml-2 text-xs font-normal text-gray-400">(you)</span>}
                      </td>
                      <td className={tdClass}>{u.email}</td>
                      <td className={tdClass}>
                        <Badge tone={ROLE_TONES[u.role]} className="capitalize">
                          {u.role}
                        </Badge>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(u.created_at)}</td>
                      <td className={`${tdClass} text-right`}>
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            disabled={busyId === u.id}
                            className={deleteButtonClass}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            {busyId === u.id ? 'Deleting…' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'vehicles' &&
              (data.vehicles.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-gray-500">No vehicles listed.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={thClass}>Vehicle</th>
                      <th className={thClass}>Seller</th>
                      <th className={thClass}>Price</th>
                      <th className={thClass}>Listed</th>
                      <th className={thClass}>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.vehicles.map((v) => (
                      <tr key={v.id}>
                        <td className={tdClass}>
                          <Link to={`/vehicles/${v.id}`} className="flex items-center gap-3 hover:text-brand-700">
                            <VehicleImage path={v.image_paths[0]} alt="" className="aspect-[4/3] w-16 shrink-0 rounded-md" />
                            <span className="font-medium text-gray-900">{v.title}</span>
                          </Link>
                        </td>
                        <td className={tdClass}>
                          <p>{v.seller?.name}</p>
                          <p className="text-xs text-gray-400">{v.seller?.email}</p>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap`}>{formatPrice(v.price)}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{formatDate(v.created_at)}</td>
                        <td className={`${tdClass} text-right`}>
                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(v)}
                            disabled={busyId === v.id}
                            className={deleteButtonClass}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            {busyId === v.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}

            {tab === 'messages' &&
              (data.messages.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-gray-500">No messages yet.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={thClass}>From</th>
                      <th className={thClass}>Vehicle</th>
                      <th className={thClass}>Message</th>
                      <th className={thClass}>Sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.messages.map((m) => (
                      <tr key={m.id}>
                        <td className={tdClass}>
                          <p className="font-medium text-gray-900">{m.sender_name}</p>
                          <p className="text-xs text-gray-400">{m.email}</p>
                        </td>
                        <td className={tdClass}>
                          <Link to={`/vehicles/${m.vehicle.id}`} className="text-brand-700 hover:underline">
                            {m.vehicle.title}
                          </Link>
                        </td>
                        <td className={`${tdClass} min-w-64 max-w-md whitespace-pre-line`}>{m.message}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>{formatDate(m.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
          </div>
        </>
      )}
    </>
  );
}
