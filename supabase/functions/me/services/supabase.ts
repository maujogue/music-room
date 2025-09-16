import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatDbError } from '../../../utils/postgres_errors_map.tsx';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'

const supabase = createClient(
  Deno.env.get('EXPO_PUBLIC_SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function getCurrentUserPlaylistSupabase(userId: string): Promise<any[]> {
    const { data, error } = await supabase.from('playlists')
        .select('*')
        .eq('owner_id', userId);

    if (error) {
        console.error('Supabase error:', error);
        const pgError = formatDbError(error);
        throw new HTTPException(pgError.status, { message: pgError.message });
    }

    return data;
}

export async function getSupabaseEventByOwner(ownerId: string): Promise<any[]> {
  const { data, error } = await supabase.from('events')
	.select('*')
	.eq('owner_id', ownerId);

  if (error) {
	console.error('Supabase error:', error);
  const pgError = formatDbError(error);
	throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return data;
}
