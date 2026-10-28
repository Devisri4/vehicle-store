import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

const LINKS = [
  { to: '/dashboard', label: 'Browse vehicles' },
  { to: '/signup', label: 'Sell your vehicle' },
  { to: '/login', label: 'Log in' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-gray-500">
              A trusted marketplace for buying and selling pre-owned vehicles.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-gray-600 transition hover:text-brand-700">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 border-t border-gray-100 pt-6 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Second-Hand Vehicle Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
