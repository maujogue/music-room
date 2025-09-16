import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatDbError } from '../../../utils/postgres_errors_map.tsx';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
//import { CreatePlaylistPayload } from '../../../types/playlist.d.ts';

const supabase = createClient(
  Deno.env.get('EXPO_PUBLIC_SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function getSupabasePlaylistByOwner(ownerId: string): Promise<any[]> {
    const { data, error } = await supabase.from('playlists')
        .select('*')
        .eq('owner_id', ownerId);

    if (error) {
        console.error('Supabase error:', error);
        const pgError = formatDbError(error);
        throw new HTTPException(pgError.status, { message: pgError.message });
    }

    return data;
}

export async function createPlaylistInSupabase(
  owner_id: string,
  payload: CreatePlaylistPayload
): Promise<PlaylistResponse> {
    console.log('Creating playlist in Supabase for owner:', owner_id, 'with payload:', payload);
  const { data, error } = await supabase.from('playlists')
    .insert([{
      owner_id,
      name: payload.name,
      description: payload.description,
      cover_url: payload.cover_url,
      is_private: payload.is_private,
      is_collaborative: payload.is_collaborative
    }])
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return data;
}

export async function getSupabasePlaylistById(id: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_playlist_complete', {
          p_playlist_id: id
      });

    if (error) {
        console.error('Supabase error:', error);
        const pgError = formatDbError(error);
        throw new HTTPException(pgError.status, { message: pgError.message });
    }
    return data;
}

export async function deletePlaylistInSupabase(id: string): Promise<any> {
    const { data, error } = await supabase.from('playlists')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Supabase error:', error);
        const pgError = formatDbError(error);
        throw new HTTPException(pgError.status, { message: pgError.message });
    }

    return data;
}

export async function addTracksToPlaylistInSupabase(playlist_id: string, tracks: string[], added_by: string): Promise<any> {
    const { data, error } = await supabase.from('playlist_tracks')
        .insert(tracks.map(track_id => ({
            playlist_id,
            track_id,
            added_by
        })));

    if (error) {
        console.error('Supabase error:', error);
        const pgError = formatDbError(error);
        throw new HTTPException(pgError.status, { message: pgError.message });
    }
}
