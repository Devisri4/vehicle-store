import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

const mobileLink = ({ isActive }) =>
  `block rounded-lg px-3 py-2.5 text-base font-medium transition ${
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

function Avatar({ name }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-semibold text-white ring-2 ring-white">
      {initials(name)}
    </span>
  );
}

function UserBadge({ profile }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={profile.name} />
      <div className="min-w-0 leading-tight">
        <p className="max-w-[10rem] truncate text-sm font-semibold text-gray-900">{profile.name}</p>
        <p className="text-xs capitalize text-gray-500">{profile.role}</p>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const links = profile ? (LINKS_BY_ROLE[profile.role] ?? []) : [];

  // Close the mobile menu whenever the page changes
  useEffect(() => setOpen(false), [pathname]);

  async function handleLogout() {
    setOpen(false);
    await signOut();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Vehicle Store home" className="shrink-0 rounded-lg">
          <Logo />
        </Link>

        {/* Left: page links (desktop) */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className={desktopLink}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: user, then Logout at the far edge (desktop) */}
        <div className="ml-auto hidden items-center lg:flex">
          {profile ? (
            <>
              <UserBadge profile={profile} />
              <span className="mx-5 h-8 w-px bg-gray-200" aria-hidden="true" />
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Log in
              </Link>
              <Link to="/signup" className={primaryButtonClass}>
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Tablet / mobile: avatar + menu button */}
        <div className="ml-auto flex items-center gap-3 lg:hidden">
          {profile && (
            <span className="hidden sm:block">
              <Avatar name={profile.name} />
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-gray-200 bg-white shadow-lg lg:hidden">
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6">
            {profile && (
              <div className="rounded-xl bg-gray-50 p-3">
                <UserBadge profile={profile} />
              </div>
            )}
            {links.length > 0 && (
              <nav className="space-y-1" aria-label="Main">
                {links.map((link) => (
                  <NavLink key={link.to} to={link.to} end className={mobileLink}>
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            )}
            <div className="border-t border-gray-100 pt-4">
              {profile ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Log in
                  </Link>
                  <Link to="/signup" className={primaryButtonClass}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
