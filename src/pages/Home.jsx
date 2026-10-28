import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, MessageSquare, Search, ShieldCheck, Store, Tag } from 'lucide-react';
import ConnectionStatus from '../components/ConnectionStatus.jsx';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import { dashboardPath, useAuth } from '../context/AuthContext.jsx';
import usePageTitle from '../lib/usePageTitle.js';

const STEPS = [
  { icon: Search, title: 'Browse listings', text: 'Explore second-hand cars and bikes with photos, prices and full details.' },
  { icon: MessageSquare, title: 'Contact the seller', text: 'Send a message straight from the listing to ask questions or arrange a visit.' },
  { icon: Tag, title: 'Sell your vehicle', text: 'Create a seller account, post your vehicle with photos and manage your listings.' },
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Secure accounts', text: 'Encrypted logins and role-based access keep buyer and seller data protected.' },
  { icon: Store, title: 'Seller tools', text: 'Post, edit and remove your listings and read buyer messages in one place.' },
  { icon: MessageSquare, title: 'Direct messaging', text: 'Buyers reach sellers directly. No middlemen, no hidden fees.' },
];

const ctaPrimary =
  'inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-brand-800 shadow-sm transition hover:bg-brand-50 active:scale-[0.98]';
const ctaSecondary =
  'inline-flex items-center rounded-lg px-6 py-3 font-semibold text-white ring-1 ring-inset ring-white/30 transition hover:bg-white/10';

// Landing page (replaces the original client/index.html)
export default function Home() {
  usePageTitle();
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-brand-950 text-white">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(29,95,191,0.45),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-inset ring-white/15">
                <BadgeCheck className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
                Trusted marketplace for pre-owned vehicles
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Find your next vehicle <span className="text-brand-300">with confidence.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100/90">
                Quality pre-owned cars and bikes from real sellers, or list your own vehicle in minutes.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                {profile ? (
                  <Link to={dashboardPath(profile.role)} className={ctaPrimary}>
                    Go to my dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <>
                    <Link to="/dashboard" className={ctaPrimary}>
                      Browse vehicles <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link to="/signup" className={ctaSecondary}>
                      Create free account
                    </Link>
                  </>
                )}
              </div>
              {profile && (
                <p className="mt-4 text-sm text-brand-100/80">
                  Logged in as <strong className="font-semibold text-white">{profile.name}</strong> ({profile.role})
                </p>
              )}
              {import.meta.env.DEV && <ConnectionStatus />}
            </div>

            {/* Hero photo */}
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-500/20 blur-2xl" aria-hidden="true" />
              <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                <img
                  src="/images/hero-car.jpg"
                  alt="Blue sports coupe parked on a desert road at sunset"
                  width="1600"
                  height="1067"
                  className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
                />
              </div>
              <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-gray-900 shadow-xl ring-1 ring-black/5 sm:left-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">Verified accounts</p>
                  <p className="text-xs text-gray-500">Every seller signs in to list</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Buying or selling, made simple</h2>
            <p className="mt-4 text-gray-500">Three simple steps whether you are buying or selling.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-7 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-gray-300">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-gray-200 bg-gray-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-3 lg:px-8">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-card ring-1 ring-gray-200">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action */}
        {!profile && (
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="relative isolate flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-brand-900 px-8 py-12 text-white sm:px-12 md:flex-row md:items-center">
              <div
                className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,rgba(29,95,191,0.5),transparent_60%)]"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to sell your vehicle?</h2>
                <p className="mt-2 text-brand-100/90">Create a free seller account and post your first listing today.</p>
              </div>
              <Link to="/signup" className={`${ctaPrimary} shrink-0`}>
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
