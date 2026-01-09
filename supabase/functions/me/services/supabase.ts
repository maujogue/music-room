import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatDbError } from '../../../utils/postgres_errors_map.ts';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function getCurrentUserPlaylistSupabase(userId: string): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_user_all_playlists_with_owner', {
        p_user_id: userId
    });

    if (error) {
        console.error('Supabase error:', error);
        const pgError = formatDbError(error);
        throw new HTTPException(pgError.status, { message: pgError.message });
    }

    return data;
}

export async function getSupabaseEventByOwner(ownerId: string): Promise<any[]> {
  const { data, error } = await supabase.rpc('get_user_events', { p_user_id: ownerId });

  if (error) {
    console.error('Supabase error:', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return data;
}

export async function getUserSubscription(userId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no subscription found, return null (not an error)
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Supabase error fetching subscription:', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return data;
}

export async function requirePremiumSubscription(userId: string): Promise<void> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw JSON.stringify({ subscription_required: true });
  }
}
