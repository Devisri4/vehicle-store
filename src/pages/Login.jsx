import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { Field, FormMessage, primaryButtonClass } from '../components/ui.jsx';
import { dashboardPath, useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

// Port of the original client/login.html
export default function Login() {
  const { session, profile, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Once logged in (and the profile has loaded), send the user to their page
  if (session && !loading) {
    return <Navigate to={location.state?.from ?? dashboardPath(profile?.role)} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSubmitting(false);
    if (error) {
      const text =
        error.code === 'invalid_credentials'
          ? 'Invalid email or password.'
          : error.code === 'email_not_confirmed'
            ? 'Please confirm your email address first (check your inbox).'
            : error.message;
      setMessage({ type: 'error', text });
    }
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
        <button type="submit" disabled={submitting || !supabase} className={`${primaryButtonClass} w-full`}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}
