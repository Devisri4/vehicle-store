import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { dashboardPath, useAuth } from '../context/AuthContext.jsx';
import { supabaseConfigured } from '../lib/supabase.js';

// Page-level guard for a better experience only; the real protection is Row Level Security in Supabase.
export default function ProtectedRoute({ roles }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (!supabaseConfigured) return <Notice text="The app is not connected to Supabase yet." />;
  if (loading) return <Notice text="Loading…" />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!profile) return <Notice text="Your account profile could not be loaded. Please log out and try again." />;
  if (roles && !roles.includes(profile.role)) return <Navigate to={dashboardPath(profile.role)} replace />;

  return <Outlet />;
}

function Notice({ text }) {
  return <p className="py-24 text-center text-sm text-gray-500">{text}</p>;
}
