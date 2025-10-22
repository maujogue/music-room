import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatDbError } from '../../../utils/postgres_errors_map.ts';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
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
      is_collaborative: payload.is_collaborative,
      cover_url: payload.cover_url
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

export async function removeUserFromPlaylistInSupabase(
  playlist_id: string,
  user_id: string,
  role: string | undefined
): Promise<any> {

  if (role === 'member' || !role) {
    const { error: memberError } = await supabase.from('playlist_members')
      .delete()
      .eq('playlist_id', playlist_id)
      .eq('user_id', user_id);

    if (memberError) {
      console.error('Supabase error (remove from playlist_members):', memberError);
      const pgError = formatDbError(memberError);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }
  }

  // Remove from playlist_collaborators
  const { error: collaboratorError } = await supabase.from('playlist_collaborators')
    .delete()
    .eq('playlist_id', playlist_id)
    .eq('user_id', user_id);

  if (collaboratorError) {
    console.error('Supabase error (remove from playlist_collaborators):', collaboratorError);
    const pgError = formatDbError(collaboratorError);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
}

