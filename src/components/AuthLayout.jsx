import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Logo from './Logo.jsx';

const POINTS = [
  'Browse pre-owned cars and bikes from real sellers',
  'Contact sellers directly from any listing',
  'List your own vehicle in minutes',
];

// Split-screen layout for Login and Sign Up: photo + brand panel on large screens, form card on the right.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="relative isolate hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <img
          src="/images/auth-car.jpg"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950 via-brand-950/80 to-brand-950/40"
          aria-hidden="true"
        />
        <Link to="/" aria-label="Vehicle Store home" className="self-start rounded-xl">
          <Logo inverted />
        </Link>
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Your trusted marketplace for pre-owned vehicles.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-brand-100">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-brand-200/80">&copy; {new Date().getFullYear()} Second-Hand Vehicle Store</p>
      </aside>

      <main className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 inline-block rounded-xl lg:hidden" aria-label="Vehicle Store home">
            <Logo />
          </Link>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
          <p className="mt-6 text-center text-sm text-gray-500">{footer}</p>
        </div>
      </main>
    </div>
  );
}
