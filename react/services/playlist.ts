import { apiFetch } from '@/utils/apiFetch';

export async function getCurrentUserPlaylists() {
  const res = await apiFetch<Playlist[]>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/playlists`,
    {
      method: 'GET',
    }
  );
  console.log('API response:', res);
  if (!res.success) {
    console.error('Error fetching user playlists:', res.error);
    throw res.error;
  }
  return res.data;
}

export async function getPlaylistById(id: string) {
  console.log(`Fetching playlist with id: ${id}`);
  const res = await apiFetch<Playlist>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${id}`,
    {
      method: 'GET',
    }
  );

  console.log('API response:', res);

  if (!res.success) {
    console.error('Error fetching playlist:', res.error);
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

  console.log('Items added successfully:', res.data);
  return res.data;
}

export async function deleteItemFromPlaylist(
  playlistId: string,
  uris: string[]
) {
  console.log(`Deleting items from playlist ${playlistId}:`, uris);
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
  console.log('Items deleted successfully from playlist');
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
  console.log('Playlist deleted successfully');
  return res.success;
}

export async function editPlaylistById(
  playlistId: string,
  payload: PlaylistPayload
) {
  console.log(`Updating playlist ${playlistId} with payload:`, payload);
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
  console.log('Playlist updated successfully:', res.data);
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
  console.log('Spotify playlists synchronized successfully:', res.data);
  return res.data;
}

export async function addUserToPlaylist(
  playlistId: string,
  userId: string,
  role: 'member' | 'collaborator'
) {
  console.log(
    `Inviting user ${userId} to playlist ${playlistId} with role ${role}`
  );
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
  console.log('Member invited successfully:', res.data);
  return res.data;
}

export async function removeUserFromPlaylist(
  playlistId: string,
  userId: string,
  role?: 'member' | 'collaborator'
) {
  console.log(`Removing user ${userId} from playlist ${playlistId}`);
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
  console.log('User removed successfully:', res.data);
  return res.data;
}
