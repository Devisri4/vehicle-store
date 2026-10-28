import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { Field, FormMessage, primaryButtonClass } from '../components/ui.jsx';
import { dashboardPath, useAuth } from '../context/AuthContext.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { supabase } from '../lib/supabase.js';
import usePageTitle from '../lib/usePageTitle.js';

const MIN_PASSWORD = 8;

// New page: opened from the reset email. Supabase reads the token in the link and signs the user in,
// so here they only need to choose the new password.
export default function ResetPassword() {
  usePageTitle('Choose a new password');
  const { session, profile, loading } = useAuth();
  const { toast } = useFeedback();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'The two passwords do not match.' });
      return;
    }
    setMessage(null);
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      const text =
        error.code === 'weak_password'
          ? `Password is too weak. Use at least ${MIN_PASSWORD} characters.`
          : error.code === 'same_password'
            ? 'New password must be different from the old one.'
            : error.message;
      setMessage({ type: 'error', text });
      return;
    }
    toast('Your password was changed.');
    navigate(dashboardPath(profile?.role), { replace: true });
  }

  const footer = (
    <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
      Back to log in
    </Link>
  );

  if (loading) {
    return (
      <AuthLayout title="Choose a new password" subtitle="Checking your reset link…" footer={footer}>
        <div className="h-24" />
      </AuthLayout>
    );
  }

  if (!session) {
    return (
      <AuthLayout
        title="Link expired"
        subtitle="This reset link is invalid or has already been used."
        footer={footer}
      >
        <Link to="/forgot-password" className={`${primaryButtonClass} w-full`}>
          Send a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle={`Use at least ${MIN_PASSWORD} characters.`} footer={footer}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          label="New password"
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          label="Confirm new password"
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <FormMessage message={message} />
        <button type="submit" disabled={saving} className={`${primaryButtonClass} w-full`}>
          {saving ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </AuthLayout>
  );
}
