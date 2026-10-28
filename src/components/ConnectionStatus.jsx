import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase.js';

// Temporary setup check: confirms the app can reach the Supabase database.
export default function ConnectionStatus() {
  const [status, setStatus] = useState(supabaseConfigured ? 'checking' : 'missing');
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true })
      .then(({ count: total, error }) => {
        if (error) {
          console.error('Supabase check failed:', error);
          setStatus('error');
        } else {
          setCount(total);
          setStatus('ok');
        }
      });
  }, []);

  const messages = {
    missing: ['bg-yellow-100 text-yellow-800', 'Supabase keys not set yet'],
    checking: ['bg-gray-100 text-gray-700', 'Checking database connection…'],
    error: ['bg-red-100 text-red-800', 'Could not reach the database (see browser console)'],
    ok: ['bg-green-100 text-green-800', `Database connected · ${count} vehicle(s) listed`],
  };
  const [classes, text] = messages[status];

  return <p className={`mt-6 rounded-md px-3 py-1 text-xs ${classes}`}>{text}</p>;
}
