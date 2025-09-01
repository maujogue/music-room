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
