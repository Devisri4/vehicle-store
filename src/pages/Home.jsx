import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, MessageSquare, Search, ShieldCheck, Store, Tag } from 'lucide-react';
import ConnectionStatus from '../components/ConnectionStatus.jsx';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import { dashboardPath, useAuth } from '../context/AuthContext.jsx';

const STEPS = [
  { icon: Search, title: 'Browse listings', text: 'Explore second-hand cars and bikes with photos, prices and details.' },
  { icon: MessageSquare, title: 'Contact the seller', text: 'Send a message straight from the listing to ask questions or arrange a visit.' },
  { icon: Tag, title: 'Sell your vehicle', text: 'Create a seller account, post your vehicle with a photo and manage your listings.' },
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Secure accounts', text: 'Encrypted logins and role-based access keep buyer and seller data protected.' },
  { icon: Store, title: 'Seller tools', text: 'Post, edit and remove your listings and read buyer messages in one place.' },
  { icon: MessageSquare, title: 'Direct messaging', text: 'Buyers reach sellers directly — no middlemen, no hidden fees.' },
];

// Landing page (replaces the original client/index.html)
export default function Home() {
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-white/20">
                Trusted marketplace for pre-owned vehicles
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Buy and sell second-hand vehicles with confidence.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-brand-100">
                Find quality pre-owned cars and bikes from real sellers, or list your own vehicle in minutes.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                {profile ? (
                  <Link
                    to={dashboardPath(profile.role)}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-accent-dark"
                  >
                    Go to my dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-accent-dark"
                    >
                      Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center rounded-lg bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>
              {profile && (
                <p className="mt-4 text-sm text-brand-100">
                  Logged in as <strong className="text-white">{profile.name}</strong> ({profile.role})
                </p>
              )}
              {import.meta.env.DEV && <ConnectionStatus />}
            </div>

            {/* Illustrative listing card */}
            <div className="hidden lg:block" aria-hidden="true">
              <div className="ml-auto max-w-sm rotate-2 rounded-2xl bg-white p-4 text-gray-900 shadow-2xl">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Example listing</p>
                <div className="flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100">
                  <img src="https://cdn-icons-png.flaticon.com/512/744/744465.png" alt="" className="h-28" />
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">Hatchback · 2019</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" /> Hyderabad
                    </p>
                  </div>
                  <span className="rounded-md bg-brand-50 px-2 py-1 text-sm font-semibold text-brand-700">₹ 6.5 L</span>
                </div>
                <div className="mt-4 rounded-lg bg-brand-700 py-2 text-center text-sm font-semibold text-white">
                  Contact seller
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-3 text-gray-500">Three simple steps whether you are buying or selling.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-gray-400">Step {index + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-3 lg:px-8">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon className="h-7 w-7 text-brand-600" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action */}
        {!profile && (
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-brand-700 px-8 py-12 text-white md:flex-row">
              <div>
                <h2 className="text-2xl font-semibold">Ready to sell your vehicle?</h2>
                <p className="mt-2 text-brand-100">Create a free seller account and post your first listing today.</p>
              </div>
              <Link
                to="/signup"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Create account <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
