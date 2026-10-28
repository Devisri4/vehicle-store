import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import { Field, FormMessage, primaryButtonClass } from '../components/ui.jsx';
import { isDemoAccount } from '../lib/demo.js';
import { supabase } from '../lib/supabase.js';
import usePageTitle from '../lib/usePageTitle.js';

// New page: emails a password-reset link. The link opens /reset-password.
export default function ForgotPassword() {
  usePageTitle('Forgot password');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const address = email.trim();
    if (isDemoAccount(address)) {
      setMessage({ type: 'error', text: 'Demo accounts do not need a password reset. Use the demo buttons on the login page.' });
      return;
    }
    setMessage(null);
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSending(false);
    if (error) {
      const text =
        error.code === 'over_email_send_rate_limit'
          ? 'Too many emails were sent recently. Please wait a while and try again.'
          : error.message;
      setMessage({ type: 'error', text });
      return;
    }
    // Same message whether or not the address has an account, so this page can't be used to discover users
    setSent(true);
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account email and we'll send you a link to choose a new password."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to log in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          <p className="flex items-center gap-2 font-semibold">
            <MailCheck className="h-5 w-5" aria-hidden="true" /> Check your inbox
          </p>
          <p className="mt-1">
            If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way. It may take a few
            minutes and can land in spam.
          </p>
        </div>
      ) : (
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
          <FormMessage message={message} />
          <button type="submit" disabled={sending || !supabase} className={`${primaryButtonClass} w-full`}>
            {sending ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
