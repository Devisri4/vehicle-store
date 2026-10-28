import { createClient } from '@supabase/supabase-js';

// Vercel serverless function: GET /api/health
// Runs one tiny read so the Supabase project counts as active. Free Supabase projects are paused
// after a week without activity; .github/workflows/keep-alive.yml calls this every few days.
// Uses only the public (publishable) key, so it can read nothing that the website itself cannot.

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  res.setHeader('Cache-Control', 'no-store');
  if (!url || !key) return res.status(500).json({ ok: false, error: 'Supabase is not configured.' });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { count, error } = await supabase.from('vehicles').select('id', { count: 'exact', head: true });
  if (error) {
    console.error('health: database check failed', error);
    return res.status(503).json({ ok: false, error: 'Database unavailable.' });
  }
  // The deployed commit lets the end-to-end test workflow wait until a new push is actually live
  return res.status(200).json({
    ok: true,
    vehicles: count,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    checkedAt: new Date().toISOString(),
  });
}
