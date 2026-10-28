import { createClient } from '@supabase/supabase-js';

// Vercel serverless function: POST /api/delete-user  { "userId": "<uuid>" }
// Replaces the original DELETE /api/admin/users/:id route.
// Runs only on Vercel's servers, so the secret key never reaches the browser.
// Deleting the auth user cascades to the profile, their vehicles and all related messages.

const BUCKET = 'vehicle-images';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) {
    console.error('delete-user: SUPABASE_SECRET_KEY or SUPABASE_URL is not set');
    return res.status(500).json({ error: 'Server is not configured for user deletion.' });
  }

  const admin = createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });

  // 1. Identify the caller from their login token
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Not logged in.' });
  const { data: callerData, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !callerData?.user) return res.status(401).json({ error: 'Not logged in.' });
  const callerId = callerData.user.id;

  // 2. Only admins may delete users
  const { data: callerProfile } = await admin.from('profiles').select('role').eq('id', callerId).maybeSingle();
  if (callerProfile?.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });

  // 3. Validate the target
  const userId = req.body?.userId;
  if (typeof userId !== 'string' || !UUID.test(userId)) return res.status(400).json({ error: 'Invalid user id.' });
  if (userId === callerId) return res.status(400).json({ error: 'You cannot delete your own account.' });

  const { data: target, error: targetError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  if (targetError) {
    console.error('delete-user: profile lookup failed', targetError);
    return res.status(500).json({ error: 'Could not delete this user.' });
  }
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if (target.role === 'admin') return res.status(400).json({ error: 'Admin accounts cannot be deleted here.' });

  // 4. Delete the account (database rows cascade)
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('delete-user: deleteUser failed', deleteError);
    return res.status(500).json({ error: 'Could not delete this user.' });
  }

  // 5. Remove their photos. The account is already gone, so a failure here only leaves unused files.
  const { data: files, error: listError } = await admin.storage.from(BUCKET).list(userId, { limit: 1000 });
  if (listError) console.error('delete-user: listing photos failed', listError);
  if (files?.length) {
    const { error: removeError } = await admin.storage.from(BUCKET).remove(files.map((f) => `${userId}/${f.name}`));
    if (removeError) console.error('delete-user: removing photos failed', removeError);
  }

  return res.status(200).json({ ok: true });
}
