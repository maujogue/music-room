import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatDbError } from '../../../utils/postgres_errors_map.tsx';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'

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

    console.log('Fetched playlist by ID from Supabase:', data);
    console.log('Supabase error (if any):', error);
    if (error) {
        console.error('Supabase error:', error);
        const pgError = formatDbError(error);
        throw new HTTPException(pgError.status, { message: pgError.message });
    }
    return data;
}

export async function deletePlaylistInSupabase(id: string, user_id: string): Promise<any> {
    const { error } = await supabase.from('playlists')
        .delete()
        .eq('id', id)
        .eq('owner_id', user_id);

    if (error) {
        console.error('Supabase error:', error);
        const pgError = formatDbError(error);
        throw new HTTPException(pgError.status, { message: pgError.message });
    }
}

export async function isPlaylistCollaborator(playlist_id: string, user_id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('playlist_collaborators')
    .select('user_id')
    .eq('playlist_id', playlist_id)
    .eq('user_id', user_id)
    .maybeSingle();

  if (error) {
    console.error('Supabase error (check collaborator):', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return !!data;
}

export async function addTracksToPlaylistInSupabase(playlist_id: string, tracks: string[], added_by: string): Promise<any> {
  const { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select('owner_id')
    .eq('id', playlist_id)
    .maybeSingle();

  if (playlistError) {
    console.error('Supabase error (fetch playlist):', playlistError);
    const pgError = formatDbError(playlistError);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  if (!playlist) {
    throw new HTTPException(404, { message: 'Playlist not found' });
  }

  if (playlist.owner_id !== added_by) {
    const isCollab = await isPlaylistCollaborator(playlist_id, added_by);
    if (!isCollab) {
      console.error('User is not a collaborator of the playlist');
      throw new HTTPException(403, { message: 'User is not a collaborator of the playlist' });
    }
  }

  const payload = tracks.map(track_id => ({
    playlist_id,
    track_id,
    added_by
  }));

  const { data, error } = await supabase.from('playlist_tracks')
    .upsert(payload, { onConflict: 'playlist_id,track_id' })
    .select();

  if (error) {
    console.error('Supabase error (upsert tracks):', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return data;
}

export async function deleteTracksFromPlaylistInSupabase(playlist_id: string, track_ids: string[]): Promise<any> {
    const response = await supabase.from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlist_id)
        .in('track_id', track_ids);

    const { data, error } = response;

    if (error) {
        console.error('Supabase error:', error);
        const pgError = formatDbError(error);
        throw new HTTPException(pgError.status, { message: pgError.message });
    }
}

export async function editPlaylistSupabaseById(
  id: string,
  payload: Partial<CreatePlaylistPayload>
): Promise<any> {
  const { error } = await supabase.from('playlists')
    .update({
      name: payload.name,
      description: payload.description,
      is_private: payload.is_private,
      is_collaborative: payload.is_collaborative
    })
    .eq('id', id)

  if (error) {
      console.error('Supabase error:', error);
      const pgError = formatDbError(error);
      throw new HTTPException(pgError.status, { message: pgError.message });
  }
}

export async function addUserToPlaylistInSupabase(
  playlist_id: string,
  user_id: string,
  role: string
): Promise<any> {
  console.log('Adding user to playlist in Supabase:', playlist_id, user_id, role);

  let result;

  if (role === 'member') {
    result = await supabase.from('playlist_members')
      .upsert([{ playlist_id, user_id }])
      .select();
  } else if (role === 'collaborator') {
    result = await supabase.from('playlist_collaborators')
      .upsert([{ playlist_id, user_id, role }])
      .select();
  } else {
    throw new HTTPException(400, { message: 'Invalid role. Must be "member" or "collaborator"' });
  }

  const { data, error } = result;

  if (error) {
    console.error('Supabase error (add user to playlist):', error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return data;
}

