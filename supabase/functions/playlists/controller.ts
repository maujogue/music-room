import { Hono } from 'jsr:@hono/hono'
import { Context } from 'https://deno.land/x/hono@v3.2.3/mod.ts'
import {
  checkPermission,
  checkPlaylistAccess,
  PERMISSIONS,
  getUserRoleInPlaylist
} from './permissions.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'
import {
  createSpotifyPlaylist,
  postItemsToSpotifyPlaylist,
  deleteItemsFromSpotifyPlaylist,
  fetchSpotifyPlaylist,
  fetchSpotifyUserProfile,
  fetchSpotifyTracks,
  fetchSpotifyPlaylistTracksIds
} from './services/spotify.ts'
import {
  getSupabasePlaylistByOwner,
  createPlaylistInSupabase,
  getSupabasePlaylistById,
  deletePlaylistInSupabase,
  addTracksToPlaylistInSupabase,
  deleteTracksFromPlaylistInSupabase,
  editPlaylistSupabaseById,
  addUserToPlaylistInSupabase,
  removeUserFromPlaylistInSupabase
} from './services/supabase.ts'
import {
  validateCreatePlaylistPayload,
  validateDeleteTracksPayload,
  validateEditPlaylistPayload,
  validateAddUserPayload,
  validateRemoveUserPayload
} from './validators.ts';


export async function deleteItemsFromPlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { uris } = validateDeleteTracksPayload(body)

  // Récupérer l'ID utilisateur depuis le token JWT
  const userId = c.get('userId') // Supposant que l'userId est dans le context après auth middleware

  // Vérifier les permissions
  await checkPermission(id, userId, PERMISSIONS.DELETE_SONG)

  await deleteTracksFromPlaylistInSupabase(
    id,
    uris
  )

  c.status(200)
}

export async function addItemsToPlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { uris } = validateAddTracksPayload(body)

  // Vérifier les permissions pour ajouter des chansons
  const userId = c.get('userId')
  await checkPermission(id, userId, PERMISSIONS.ADD_SONG)

  await addTracksToPlaylistInSupabase(
    id,
    uris
  )

  c.status(201)
}

export async function fetchPlaylistItems(c: Context): Promise<any> {
  const id = c.req.param('id')
  const user = c.get('user')

  let playlist = await getSupabasePlaylistById(id)

  checkPlaylistAccess(playlist, user.id)

  if (!playlist) {
    c.status(500)
    return c.text('Failed to fetch Spotify playlists')
  }

  if (playlist.is_spotify_sync && playlist.spotify_id) {
    const tracksIds = await fetchSpotifyPlaylistTracksIds(playlist, c.get('spotify_token'))
    if (tracksIds) {
      await addTracksToPlaylistInSupabase(playlist.id, tracksIds, playlist.owner_id)
      playlist = await getSupabasePlaylistById(playlist.id)
    }
  }

  if (playlist.tracks && playlist.tracks.length !== 0) {
    const spotify_token = c.get('spotify_token')
    const trackIds = playlist.tracks.map((track: any) => track.spotify_id)
    const spotifyTracksData = await fetchSpotifyTracks(spotify_token, trackIds)


    if (spotifyTracksData.error) {
      c.status(spotifyTracksData.error.status || 500)
      return c.json({ error: spotifyTracksData.error.message || 'Unknown error from Spotify API' })
    }

    playlist.tracks = playlist.tracks.map((track: any) => {
      const spotifyTrack = spotifyTracksData.tracks.find((t: any) => t.uri === track.spotify_id || t.id === track.spotify_id);
      return {
        ...track,
        details: spotifyTrack || null
      };
    });
  }
  playlist.user = {}
  playlist.user.can_edit = false
  playlist.user.can_invite = false
  playlist.user.is_following = true
  playlist.user.role = getUserRoleInPlaylist(playlist, user.id)


  if (playlist.is_collaborative || playlist.collaborators.find((collab: any) => collab.id === user.id)) {
    playlist.user.can_edit = true
  }
  if (playlist.user.role === 'owner' || !playlist.is_private || playlist.collaborators.find((collab: any) => collab.id === user.id)) {
    playlist.user.can_invite = true
  }

  const is_owner = playlist.owner.id === user.id
  const is_member = playlist.members.find((member: any) => member.id === user.id)
  const is_collaborator = playlist.collaborators.find((collab: any) => collab.id === user.id)
  if (!is_owner && !is_member && !is_collaborator) {
    playlist.user.is_following = false
    playlist.user.can_edit = false
    playlist.user.can_invite = false
  }

  console.log('Playlist user permissions:', playlist)
  c.status(200)
  return c.json(playlist)
}


export async function createPlaylist(c: Context): Promise<any> {
  const user = c.get('user');
  const body = await c.req.json();

  const validatedPayload = validateCreatePlaylistPayload(body);

  const res = await createPlaylistInSupabase(user.id, validatedPayload);
  if (!res) {
    throw new HTTPException(500, { message: 'Failed to create playlist in Supabase' });
  }

  c.status(201);
  return c.json(res);
}

export async function deletePlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const user = c.get('user')

  await checkPermission(id, user.id, PERMISSIONS.DELETE_PLAYLIST)
  await deletePlaylistInSupabase(id, user.id)

  c.status(200)
  return c.json({ message: 'Playlist deleted successfully' })
}

export async function updatePlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const body = await c.req.json()

  const validatedPayload = validateEditPlaylistPayload(body);
  await checkPermission(id, c.get('userId'), PERMISSIONS.EDIT_PLAYLIST)

  await editPlaylistSupabaseById(id, validatedPayload);
  c.status(200)
  return c.json({ message: 'Playlist updated successfully' })
}

export async function addUserToPlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const user = c.get('user')
  const { user_id, role } = validateAddUserPayload(body)

  await checkPermission(id, user.id, PERMISSIONS.ADD_USER)

  await addUserToPlaylistInSupabase(id, user_id, role)
  c.status(200)
  return c.json({ message: `User added successfully as ${role}` })
}

export async function removeUserFromPlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const user = c.get('user')
  const { user_id, role } = validateRemoveUserPayload(body)

  await checkPermission(id, user.id, PERMISSIONS.REMOVE_USER)

  await removeUserFromPlaylistInSupabase(id, user_id, role)

  console.log('User removed successfully from playlist:', { playlist_id: id, user_id, role });
  c.status(200)
  return c.json({ message: 'User removed successfully from playlist' })
}
