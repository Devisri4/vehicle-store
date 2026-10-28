import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShoppingBag, Store } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import { Field, FormMessage, primaryButtonClass } from '../components/ui.jsx';
import { dashboardPath, useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

const ROLES = [
  { value: 'buyer', label: 'Buy', hint: 'Browse and contact sellers', icon: ShoppingBag },
  { value: 'seller', label: 'Sell', hint: 'List and manage vehicles', icon: Store },
];

// Port of the original client/signup.html. Passwords are hashed and stored by Supabase Auth.
// The role is only a request: the database trigger accepts 'buyer' or 'seller', never 'admin'.
export default function Signup() {
  const { session, profile, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (session && !loading) return <Navigate to={dashboardPath(profile?.role)} replace />;

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { name: form.name.trim(), role: form.role },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setSubmitting(false);

    if (error) {
      const text =
        error.code === 'user_already_exists'
          ? 'Email already exists. Try logging in.'
          : error.code === 'weak_password'
            ? 'Password is too weak. Use at least 8 characters.'
            : error.message;
      setMessage({ type: 'error', text });
      return;
    }
    // With email confirmation on, Supabase returns no session until the link in the email is clicked
    if (!data.session) {
      setMessage({ type: 'success', text: 'Account created! Check your email to confirm it, then log in.' });
    }
    // Otherwise the user is logged in and the redirect above takes over
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join to buy or sell trusted pre-owned vehicles."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-gray-700">I want to</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const selected = form.role === role.value;
              return (
                <label
                  key={role.value}
                  className={`flex cursor-pointer flex-col rounded-lg border p-3 transition ${
                    selected ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selected}
                    onChange={update('role')}
                    className="sr-only"
                  />
                  <Icon className={`h-5 w-5 ${selected ? 'text-brand-700' : 'text-gray-500'}`} aria-hidden="true" />
                  <span className="mt-2 text-sm font-semibold text-gray-900">{role.label}</span>
                  <span className="text-xs text-gray-500">{role.hint}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <Field
          label="Full name"
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          required
          maxLength={100}
          value={form.name}
          onChange={update('name')}
        />
        <Field
          label="Email address"
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={form.email}
          onChange={update('email')}
        />
        <Field
          label="Password"
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          value={form.password}
          onChange={update('password')}
        />
        <FormMessage message={message} />
        <button type="submit" disabled={submitting || !supabase} className={`${primaryButtonClass} w-full`}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
