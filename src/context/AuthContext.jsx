import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

// Where each role lands after login (replaces the redirects in the old login.html)
export function dashboardPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'seller') return '/seller';
  return '/dashboard';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionReady, setSessionReady] = useState(!supabase);
  // Profile is stored with the user id it belongs to, so a stale profile is never shown for a new login
  const [profileState, setProfileState] = useState({ userId: null, profile: null });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });
    // Only update state here; Supabase calls must not be awaited inside this callback
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setSessionReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, name, email, role')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error('Failed to load profile:', error);
        setProfileState({ userId, profile: data ?? null });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profile = userId && profileState.userId === userId ? profileState.profile : null;
  const loading = !sessionReady || (Boolean(userId) && profileState.userId !== userId);

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
