import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
// Supabase shows this public key as either "publishable" (new) or "anon" (legacy); both work.
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// The app still renders without keys so a missing setting shows a clear message instead of a blank page.
export const supabaseConfigured = Boolean(url && key);

export const supabase = supabaseConfigured ? createClient(url, key) : null;
