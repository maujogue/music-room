import { Context } from '@hono/hono';
import {
  checkPermission,
  checkPlaylistAccess,
  PERMISSIONS,
  getUserRoleInPlaylist
} from './permissions.ts'
import {
  fetchSpotifyTracks,
  fetchSpotifyPlaylistTracksIds
} from './services/spotify.ts'
import {
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
  validateRemoveUserPayload,
  validateAddTracksPayload
} from './validators.ts';
import { refreshSpotifyToken } from '@auth/utils';
import type { 
PlaylistCollaborator,
  PlaylistMember,
  PlaylistResponse,
  PlaylistTrack,
  SpotifyTrackDetails
} from '@playlist';
import type { User } from '@supabase/supabase-js';
import type { StatusCode } from "@hono/hono/utils/http-status";


export async function deleteItemsFromPlaylist(c: Context): Promise<Response> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { uris } = validateDeleteTracksPayload(body)
  const user = c.get('user')

  await checkPermission(id, user.id, PERMISSIONS.DELETE_SONG)

  await deleteTracksFromPlaylistInSupabase(
    id,
    uris
  )

  c.status(200)
  return c.json({ message: 'Tracks deleted successfully' })
}

export async function addItemsToPlaylist(c: Context): Promise<Response> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { uris } = validateAddTracksPayload(body)
  const user = c.get('user')

  await checkPermission(id, user.id, PERMISSIONS.ADD_SONG)

  await addTracksToPlaylistInSupabase(
    id,
    uris,
    user.id
  )

  c.status(201)
  return c.json({ message: 'Tracks added successfully' })
}

export async function fetchPlaylistItems(c: Context): Promise<Response> {
  const id = c.req.param('id')
  const user = c.get('user')
  const spotify_token = c.get('spotify_token')

  if (!spotify_token) {
    c.status(401)
    return c.json({ error: 'Please connect your Spotify account' })
  }

  let playlist: PlaylistResponse = await getSupabasePlaylistById(id)

  checkPlaylistAccess(playlist, user.id)

  if (!playlist) {
    c.status(500)
    return c.text('Failed to fetch Spotify playlists')
  }

  if (playlist.is_spotify_sync && playlist.spotify_id) {
    await refreshSpotifyToken(user.id)
    const tracksIds = await fetchSpotifyPlaylistTracksIds(playlist, spotify_token)
    if (tracksIds) {
      await addTracksToPlaylistInSupabase(playlist.id, tracksIds, user.id)
      playlist = await getSupabasePlaylistById(playlist.id)
    }
  }

  if (playlist.tracks && playlist.tracks.length !== 0) {
    console.log(playlist.tracks)
    const trackIds = playlist.tracks.map((track: PlaylistTrack) => track.track_id)
    await refreshSpotifyToken(user.id)
    console.log("tracksIds:", trackIds)
    const spotifyTracksData = await fetchSpotifyTracks(spotify_token, trackIds)


    if (spotifyTracksData.error) {
      c.status(spotifyTracksData.error.status as StatusCode || 500)
      return c.json({ error: spotifyTracksData.error.message || 'Unknown error from Spotify API' })
    }

    playlist.tracks = playlist.tracks.map((track: PlaylistTrack) => {
      const spotifyTrack = spotifyTracksData.data.find((t: SpotifyTrackDetails) => t.uri === track.track_id || t.id === track.track_id);
      return {
        ...track,
        details: spotifyTrack || null
      };
    });
  }
  playlist = setUserPlaylistPermissions(playlist, user)

  c.status(200)
  return c.json(playlist)
}

function setUserPlaylistPermissions(playlist: PlaylistResponse, user: User): PlaylistResponse {
  playlist.user = {
    can_edit: false,
    can_invite: false,
    is_following: true,
    role: getUserRoleInPlaylist(playlist, user.id)
  };

  if (playlist.is_collaborative || playlist.collaborators.find((collab: PlaylistCollaborator) => collab.id === user.id)) {
    playlist.user.can_edit = true
  }
  if (playlist.user.role === 'owner' || !playlist.is_private || playlist.collaborators.find((collab: PlaylistCollaborator) => collab.id === user.id)) {
    playlist.user.can_invite = true
}

  const is_owner = playlist.owner.id === user.id
  const is_member = playlist.members.find((member: PlaylistMember) => member.id === user.id)
  const is_collaborator = playlist.collaborators.find((collab: PlaylistCollaborator) => collab.id === user.id)
  if (!is_owner && !is_member && !is_collaborator) {
    playlist.user.is_following = false
    playlist.user.can_edit = false
    playlist.user.can_invite = false
  }
  return playlist
}

export async function createPlaylist(c: Context): Promise<Response> {
  const user = c.get('user');
  const body = await c.req.json();

  const validatedPayload = validateCreatePlaylistPayload(body);

  const res = await createPlaylistInSupabase(user.id, validatedPayload);
  if (!res) {
    c.status(500);
    return c.text('Failed to create playlist');
  }

  c.status(201);
  return c.json(res);
}

export async function deletePlaylist(c: Context): Promise<Response> {
  const id = c.req.param('id')
  const user = c.get('user')

  await checkPermission(id, user.id, PERMISSIONS.DELETE_PLAYLIST)
  await deletePlaylistInSupabase(id, user.id)

  c.status(200)
  return c.json({ message: 'Playlist deleted successfully' })
}

export async function updatePlaylist(c: Context): Promise<Response> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const user = c.get('user')

  const validatedPayload = validateEditPlaylistPayload(body);
  await checkPermission(id, user.id, PERMISSIONS.EDIT_PLAYLIST)

  await editPlaylistSupabaseById(id, validatedPayload);
  c.status(200)
  return c.json({ message: 'Playlist updated successfully' })
}

export async function addUserToPlaylist(c: Context): Promise<Response> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const user = c.get('user')
  const { user_id, role } = validateAddUserPayload(body)

  await checkPermission(id, user.id, PERMISSIONS.ADD_USER)

  await addUserToPlaylistInSupabase(id, user_id, role)
  c.status(200)
  return c.json({ message: `User added successfully as ${role}` })
}

export async function removeUserFromPlaylist(c: Context): Promise<Response> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const user = c.get('user')
  const { user_id, role } = validateRemoveUserPayload(body)

  if (body.user_id !== user.id) {
    await checkPermission(id, user.id, PERMISSIONS.REMOVE_USER)
  }

  await removeUserFromPlaylistInSupabase(id, user_id, role)

  console.log('User removed successfully from playlist:', { playlist_id: id, user_id, role });
  c.status(200)
  return c.json({ message: 'User removed successfully from playlist' })
}
