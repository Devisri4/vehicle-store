import { useState } from 'react';
import { KeyRound, UserRound } from 'lucide-react';
import { Badge, Card, CardHeader, Field, FormMessage, PageHeader, primaryButtonClass } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { isDemoAccount } from '../lib/demo.js';
import { supabase } from '../lib/supabase.js';
import usePageTitle from '../lib/usePageTitle.js';

const ROLE_TONES = { admin: 'purple', seller: 'brand', buyer: 'neutral' };
const MIN_PASSWORD = 8;

function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useFeedback();
  const [name, setName] = useState(profile.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const trimmed = name.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    // Only the name column is writable by users (column grant + "update own" policy)
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ name: trimmed })
      .eq('id', user.id)
      .select('id');
    setSaving(false);
    if (updateError || data.length === 0) {
      console.error('Name update failed:', updateError);
      setError({ type: 'error', text: 'Could not save your name. Please try again.' });
      return;
    }
    refreshProfile();
    toast('Your name was updated.');
  }

  return (
    <Card className="p-6 sm:p-8">
      <CardHeader title="Profile" description="Your name is shown to sellers when you send a message." />
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          label="Full name"
          id="account-name"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">Email address</p>
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">{user.email}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Account type
          <Badge tone={ROLE_TONES[profile.role]} className="capitalize">
            {profile.role}
          </Badge>
        </div>
        <FormMessage message={error} />
        <button type="submit" disabled={saving || !trimmed || trimmed === profile.name} className={primaryButtonClass}>
          <UserRound className="h-4 w-4" aria-hidden="true" /> {saving ? 'Saving…' : 'Save name'}
        </button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const { toast } = useFeedback();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError({ type: 'error', text: 'The two passwords do not match.' });
      return;
    }
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      const text =
        updateError.code === 'weak_password'
          ? `Password is too weak. Use at least ${MIN_PASSWORD} characters.`
          : updateError.code === 'same_password'
            ? 'New password must be different from the current one.'
            : updateError.message;
      setError({ type: 'error', text });
      return;
    }
    setPassword('');
    setConfirmPassword('');
    toast('Your password was changed.');
  }

  return (
    <Card className="p-6 sm:p-8">
      <CardHeader title="Change password" description={`Use at least ${MIN_PASSWORD} characters.`} />
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
        <FormMessage message={error} />
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          <KeyRound className="h-4 w-4" aria-hidden="true" /> {saving ? 'Saving…' : 'Change password'}
        </button>
      </form>
    </Card>
  );
}

// New page: lets any logged-in user edit their name and password.
export default function Account() {
  usePageTitle('Account settings');
  const { user } = useAuth();
  const demo = isDemoAccount(user.email);

  return (
    <>
      <PageHeader title="Account settings" description="Manage your profile and password." />
      <div className="grid max-w-5xl gap-8 lg:grid-cols-2">
        <ProfileForm />
        {demo ? (
          <Card className="p-6 sm:p-8">
            <CardHeader title="Change password" />
            <p className="text-sm text-gray-500">
              This is a shared demo account, so its password can&apos;t be changed. Create your own account to try this
              feature.
            </p>
          </Card>
        ) : (
          <PasswordForm />
        )}
      </div>
    </>
  );
}
