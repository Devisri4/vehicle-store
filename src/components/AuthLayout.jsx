import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Logo from './Logo.jsx';

const POINTS = [
  'Browse pre-owned cars and bikes from real sellers',
  'Contact sellers directly from any listing',
  'List your own vehicle in minutes',
];

// Two-panel layout for Login and Sign Up: brand panel on large screens, form on the right.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-12 text-white lg:flex">
        <Link to="/" aria-label="Vehicle Store home">
          <Logo inverted />
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">Your trusted marketplace for pre-owned vehicles.</h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-brand-100">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-brand-200">&copy; {new Date().getFullYear()} Second-Hand Vehicle Store</p>
      </aside>

      <main className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="lg:hidden" aria-label="Vehicle Store home">
            <Logo />
          </Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-gray-900 lg:mt-0">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-gray-500">{footer}</p>
        </div>
      </main>
    </div>
  );
}
