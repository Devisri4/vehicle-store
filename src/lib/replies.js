import { supabase } from './supabase.js';

const REPLY_COLUMNS = 'id, message_id, sender_id, body, created_at';

// Loads the replies for several conversations at once, grouped by message id, oldest first.
export async function loadReplies(messageIds) {
  if (messageIds.length === 0) return {};
  const { data, error } = await supabase
    .from('message_replies')
    .select(REPLY_COLUMNS)
    .in('message_id', messageIds)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Failed to load replies:', error);
    return {};
  }
  const byMessage = {};
  for (const reply of data) (byMessage[reply.message_id] ??= []).push(reply);
  return byMessage;
}

// sender_id is filled in by the database; RLS only allows the buyer and seller of that conversation.
export async function sendReply(messageId, body) {
  const { data, error } = await supabase
    .from('message_replies')
    .insert({ message_id: messageId, body: body.trim() })
    .select(REPLY_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}
