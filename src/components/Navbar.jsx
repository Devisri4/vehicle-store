import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS_BY_ROLE = {
  buyer: [{ to: '/dashboard', label: 'Browse' }],
  seller: [
    { to: '/dashboard', label: 'Browse' },
    { to: '/seller', label: 'My Vehicles' },
    { to: '/post', label: 'Post Vehicle' },
    { to: '/seller/messages', label: 'Messages' },
  ],
  admin: [
    { to: '/dashboard', label: 'Browse' },
    { to: '/admin', label: 'Admin Panel' },
  ],
};

const linkClass = ({ isActive }) => (isActive ? 'font-semibold underline underline-offset-4' : 'hover:underline');

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-lg font-bold">
          🚗 Vehicle Store
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {profile ? (
            <>
              {(LINKS_BY_ROLE[profile.role] ?? []).map((link) => (
                <NavLink key={link.to} to={link.to} end className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
              <span className="rounded bg-white/15 px-2 py-0.5">
                {profile.name} · {profile.role}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded bg-accent px-3 py-1 font-semibold transition hover:bg-accent-dark"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className={linkClass}>
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
