import { supabase } from '@/services/supabase';

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Erreur récupération session:', error);
    return null;
  }

  return session;
}

/**
 * Refreshes the current session (e.g. before reconnecting WebSocket).
 * Returns the updated session or null if refresh failed.
 */
export async function refreshSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error) {
    console.error('Session refresh failed:', error);
    return null;
  }

  return session;
}
