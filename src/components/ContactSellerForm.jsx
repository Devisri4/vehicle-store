import { useState } from 'react';
import { CircleCheck, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { Field, FormMessage, inputClass, primaryButtonClass } from './ui.jsx';

const MAX_MESSAGE = 2000;

// Replaces the contact form on the original client/vehicle-detail.html.
// sender_id is filled in by the database from the logged-in user.
export default function ContactSellerForm({ vehicle }) {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [message, setMessage] = useState(`Hi, is the ${vehicle.title} still available?`);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setError(null);
    const { error: insertError } = await supabase.from('messages').insert({
      vehicle_id: vehicle.id,
      sender_name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    setSending(false);
    if (insertError) {
      console.error('Failed to send message:', insertError);
      setError({ type: 'error', text: 'Could not send your message. Please try again.' });
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <p className="flex items-center gap-2 font-semibold">
          <CircleCheck className="h-5 w-5" aria-hidden="true" /> Message sent
        </p>
        <p className="mt-1">The seller will reply to {email.trim()}.</p>
        <button
          type="button"
          onClick={() => {
            setMessage('');
            setSent(false);
          }}
          className="mt-3 font-medium text-green-900 underline hover:no-underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <Field
        label="Your name"
        id="contact-name"
        required
        maxLength={100}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Field
        label="Your email"
        id="contact-email"
        type="email"
        required
        maxLength={254}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          maxLength={MAX_MESSAGE}
          className={inputClass}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {message.length} / {MAX_MESSAGE}
        </p>
      </div>
      <FormMessage message={error} />
      <button type="submit" disabled={sending} className={`${primaryButtonClass} w-full`}>
        <Send className="h-4 w-4" aria-hidden="true" /> {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
