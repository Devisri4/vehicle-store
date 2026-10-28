import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Store } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import { Field, FormMessage, primaryButtonClass, secondaryButtonClass } from '../components/ui.jsx';
import { dashboardPath, useAuth } from '../context/AuthContext.jsx';
import { DEMO_ACCOUNTS } from '../lib/demo.js';
import { supabase } from '../lib/supabase.js';
import usePageTitle from '../lib/usePageTitle.js';

const DEMO_ICONS = { buyer: ShoppingBag, seller: Store };

// Port of the original client/login.html
export default function Login() {
  usePageTitle('Log in');
  const { session, profile, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(null);

  // Once logged in (and the profile has loaded), send the user to their page
  if (session && !loading) {
    return <Navigate to={location.state?.from ?? dashboardPath(profile?.role)} replace />;
  }

  async function logIn(credentials, source) {
    setMessage(null);
    setSubmitting(source);
    const { error } = await supabase.auth.signInWithPassword(credentials);
    setSubmitting(null);
    if (error) {
      const text =
        error.code === 'invalid_credentials'
          ? source === 'form'
            ? 'Invalid email or password.'
            : 'The demo account is not available right now.'
          : error.code === 'email_not_confirmed'
            ? 'Please confirm your email address first (check your inbox).'
            : error.message;
      setMessage({ type: 'error', text });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    logIn({ email: email.trim(), password }, 'form');
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to explore trusted second-hand vehicles."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-700 hover:text-brand-800">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          label="Email address"
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormMessage message={message} />
        <button type="submit" disabled={Boolean(submitting) || !supabase} className={`${primaryButtonClass} w-full`}>
          {submitting === 'form' ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <p className="relative mx-auto w-fit bg-white px-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          Or try a demo account
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = DEMO_ICONS[account.role];
          return (
            <button
              key={account.role}
              type="button"
              disabled={Boolean(submitting) || !supabase}
              onClick={() => logIn({ email: account.email, password: account.password }, account.role)}
              className={secondaryButtonClass}
            >
              <Icon className="h-4 w-4 text-brand-700" aria-hidden="true" />
              {submitting === account.role ? 'Logging in…' : account.label}
            </button>
          );
        })}
      </div>
    </AuthLayout>
  );
}
