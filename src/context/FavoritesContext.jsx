import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './AuthContext.jsx';
import { useFeedback } from './FeedbackContext.jsx';

// Which vehicles the logged-in user has saved, shared by every heart button on the page.
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const { toast } = useFeedback();
  const userId = user?.id ?? null;
  // Kept with the user id it belongs to, so another user's saved list is never shown after switching
  const [state, setState] = useState({ userId: null, ids: new Set() });

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    supabase
      .from('favorites')
      .select('vehicle_id')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error('Failed to load saved vehicles:', error);
        setState({ userId, ids: new Set((data ?? []).map((row) => row.vehicle_id)) });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const ids = useMemo(() => (state.userId === userId ? state.ids : new Set()), [state, userId]);

  const toggleFavorite = useCallback(
    async (vehicleId) => {
      const saved = ids.has(vehicleId);
      const update = (add) =>
        setState((current) => {
          const next = new Set(current.ids);
          if (add) next.add(vehicleId);
          else next.delete(vehicleId);
          return { userId, ids: next };
        });
      update(!saved); // optimistic: the heart changes immediately
      const { error } = saved
        ? await supabase.from('favorites').delete().eq('vehicle_id', vehicleId)
        : await supabase.from('favorites').insert({ vehicle_id: vehicleId });
      if (error) {
        console.error('Saving failed:', error);
        update(saved);
        toast('Could not update your saved vehicles. Please try again.', 'error');
        return;
      }
      toast(saved ? 'Removed from saved vehicles.' : 'Saved. Find it under Saved.');
    },
    [ids, userId, toast],
  );

  const ready = Boolean(userId) && state.userId === userId;
  const value = useMemo(
    () => ({ isFavorite: (id) => ids.has(id), toggleFavorite, ready }),
    [ids, toggleFavorite, ready],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
