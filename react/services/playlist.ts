import { apiFetch } from '@/utils/apiFetch';

export async function getCurrentUserPlaylists() {
  const res = await apiFetch<Playlist[]>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/playlists`,
    {
      method: 'GET',
    }
  );
  if (!res.success) {
    throw res.error;
  }
  return res.data;
}

export async function getPlaylistById(id: string) {
  if (!id) {
    throw new Error('no playlist found, no id given');
  }
  const res = await apiFetch<Playlist>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${id}`,
    {
      method: 'GET',
    }
  );
  if (!res.success) {
    throw res.error;
  }
  return res.data;
}

export async function addItemToPlaylist(id: string, uris: string[]) {
  const res = await apiFetch<SpotifyPlaylist>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${id}/tracks`,
    {
      method: 'POST',
      body: { uris },
    }
  );

  if (!res.success) {
    console.error('Error adding items to playlist:', res.error);
    throw res.error;
  }

  return res.data;
}

export async function deleteItemFromPlaylist(
  playlistId: string,
  uris: string[]
) {
  const res = await apiFetch<void>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${playlistId}/tracks`,
    {
      method: 'DELETE',
      body: { uris: uris.map(uri => uri) },
    }
  );
  if (!res.success) {
    console.error('Error deleting item from playlist:', res.error);
    throw res.error;
  }
  return res.success;
}

export async function deletePlaylistById(playlistId: string) {
  const res = await apiFetch<void>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${playlistId}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.success) {
    console.error('Error deleting playlist:', res.error);
    throw res.error;
  }
  return res.success;
}

export async function editPlaylistById(
  playlistId: string,
  payload: PlaylistPayload
) {
  const res = await apiFetch<SpotifyPlaylist>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${playlistId}`,
    {
      method: 'PUT',
      body: { ...payload },
    }
  );
  if (!res.success) {
    console.error('Error updating playlist:', res.error);
    throw res.error;
  }
  return res.data;
}

export async function syncSpotifyPlaylists() {
  const res = await apiFetch<{ message: string; insertedCount: number }>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/playlists/sync`,
    {
      method: 'POST',
    }
  );
  if (!res.success) {
    console.error('Error syncing Spotify playlists:', res.error);
    throw res.error;
  }

  return res.data;
}

export async function addUserToPlaylist(
  playlistId: string,
  userId: string,
  role: 'member' | 'collaborator'
) {
  const res = await apiFetch<{ message: string }>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${playlistId}/users`,
    {
      method: 'POST',
      body: { user_id: userId, role },
    }
  );
  if (!res.success) {
    console.error('Error inviting member to playlist:', res.error);
    throw res.error;
  }
  return res.data;
}

export async function removeUserFromPlaylist(
  playlistId: string,
  userId: string,
  role?: 'member' | 'collaborator'
) {
  const res = await apiFetch<{ message: string }>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${playlistId}/users`,
    {
      method: 'DELETE',
      body: { user_id: userId, role },
    }
  );
  if (!res.success) {
    console.error('Error removing user from playlist:', res.error);
    throw res.error;
  }
  return res.data;
}
