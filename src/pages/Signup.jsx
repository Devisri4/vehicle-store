import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthCard, { FormMessage, inputClass } from '../components/AuthCard.jsx';
import { dashboardPath, useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

// Port of the original client/signup.html. Passwords are hashed and stored by Supabase Auth.
// The role is only a request: the database trigger accepts 'buyer' or 'seller', never 'admin'.
export default function Signup() {
  const { session, profile, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
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
    <AuthCard
      background="bg-gradient-to-r from-[#e0f7fa] to-[#fce4ec]"
      title="Create Your Account"
      subtitle="Sign up to explore verified vehicles and trusted sellers"
      footer={
        <Link to="/login" className="hover:text-brand">
          Already have an account? Login
        </Link>
      }
    >
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          autoComplete="name"
          required
          maxLength={100}
          value={form.name}
          onChange={update('name')}
          className={inputClass}
        />
        <input
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          required
          value={form.email}
          onChange={update('email')}
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Password (min. 8 characters)"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={update('password')}
          className={inputClass}
        />
        <select required value={form.role} onChange={update('role')} className={`${inputClass} bg-white`}>
          <option value="">Select Role</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
        <button
          type="submit"
          disabled={submitting || !supabase}
          className="mt-2 w-full rounded-lg bg-[#00796b] py-3 text-base text-white transition hover:bg-[#004d40] disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Register'}
        </button>
        <FormMessage message={message} />
      </form>
    </AuthCard>
  );
}
