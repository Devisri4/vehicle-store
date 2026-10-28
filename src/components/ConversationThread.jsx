import { useState } from 'react';
import { Send } from 'lucide-react';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { sendReply } from '../lib/replies.js';
import { inputClass, primaryButtonClass } from './ui.jsx';

const MAX_REPLY = 2000;

const formatTime = (value) =>
  new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

// The replies under one enquiry, plus a box to answer. Used on both sides of the conversation.
// message: the original enquiry ({ id, sender_id, sender_name }); replies: oldest first.
export default function ConversationThread({ message, replies = [], currentUserId, onReplySent }) {
  const { toast } = useFeedback();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const authorLabel = (reply) => {
    if (reply.sender_id === currentUserId) return 'You';
    if (reply.sender_id === message.sender_id) return message.sender_name;
    return 'Seller';
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      const reply = await sendReply(message.id, body);
      onReplySent(reply);
      setBody('');
    } catch (err) {
      console.error('Reply failed:', err);
      toast('Could not send your reply. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {replies.length > 0 && (
        <ol className="space-y-3 border-l-2 border-brand-100 pl-4">
          {replies.map((reply) => {
            const mine = reply.sender_id === currentUserId;
            return (
              <li key={reply.id}>
                <p className="text-xs text-gray-400">
                  <span className={`font-semibold ${mine ? 'text-brand-700' : 'text-gray-700'}`}>
                    {authorLabel(reply)}
                  </span>{' '}
                  · {formatTime(reply.created_at)}
                </p>
                <p
                  className={`mt-1 whitespace-pre-line rounded-xl p-3 text-sm leading-relaxed ${
                    mine ? 'bg-brand-50 text-brand-900' : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-100'
                  }`}
                >
                  {reply.body}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label htmlFor={`reply-${message.id}`} className="sr-only">
          Write a reply
        </label>
        <textarea
          id={`reply-${message.id}`}
          rows={2}
          required
          maxLength={MAX_REPLY}
          placeholder="Write a reply…"
          className={`${inputClass} flex-1 resize-y`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button type="submit" disabled={sending || !body.trim()} className={`${primaryButtonClass} shrink-0`}>
          <Send className="h-4 w-4" aria-hidden="true" /> {sending ? 'Sending…' : 'Reply'}
        </button>
      </form>
    </div>
  );
}
