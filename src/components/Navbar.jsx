import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import { primaryButtonClass } from './ui.jsx';

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

const desktopLink = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

const mobileLink = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-base font-medium ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-100'
  }`;

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function UserBadge({ profile }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
        {initials(profile.name)}
      </span>
      <div className="leading-tight">
        <p className="text-sm font-medium text-gray-900">{profile.name}</p>
        <p className="text-xs capitalize text-gray-500">{profile.role}</p>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = profile ? (LINKS_BY_ROLE[profile.role] ?? []) : [];

  async function handleLogout() {
    setOpen(false);
    await signOut();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Vehicle Store home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className={desktopLink}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {profile ? (
            <>
              <UserBadge profile={profile} />
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Log in
              </Link>
              <Link to="/signup" className={primaryButtonClass}>
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          {profile && (
            <div className="mb-3 border-b border-gray-100 pb-3">
              <UserBadge profile={profile} />
            </div>
          )}
          <div className="space-y-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end className={mobileLink} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            {profile ? (
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink to="/login" className={mobileLink} onClick={() => setOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/signup" className={mobileLink} onClick={() => setOpen(false)}>
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
