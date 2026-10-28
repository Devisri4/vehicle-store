import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthCard, { FormMessage, inputClass } from '../components/AuthCard.jsx';
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
    <AuthCard
      background="bg-gradient-to-r from-[#f5f7fa] to-[#c3cfe2]"
      title="Welcome Back"
      subtitle="Login to explore trusted second-hand vehicles"
      footer={
        <Link to="/signup" className="hover:text-brand">
          Don&apos;t have an account? Sign Up
        </Link>
      }
    >
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={submitting || !supabase}
          className="mt-2 w-full rounded-lg bg-[#2e86de] py-3 text-base text-white transition hover:bg-[#1e6ab7] disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Login'}
        </button>
        <FormMessage message={message} />
      </form>
    </AuthCard>
  );
}
