import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'
import {
  createSpotifyPlaylist,
  postItemsToSpotifyPlaylist,
  deleteItemsFromSpotifyPlaylist,
  fetchSpotifyPlaylist,
  fetchSpotifyUserProfile,
  fetchSpotifyTracks
} from './services/spotify.ts'
import {
  getSupabasePlaylistByOwner,
  createPlaylistInSupabase,
  getSupabasePlaylistById,
  deletePlaylistInSupabase,
  addTracksToPlaylistInSupabase,
  deleteTracksFromPlaylistInSupabase,
  editPlaylistSupabaseById
} from './services/supabase.ts'
import {
  validateCreatePlaylistPayload,
  validateDeleteTracksPayload,
  validateEditPlaylistPayload
} from './validators.ts';


export async function deleteItemsFromPlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { uris } = validateDeleteTracksPayload(body)

  await deleteTracksFromPlaylistInSupabase(
    id,
    uris
  )

  c.status(200)
  return c.json({ message: 'Tracks deleted successfully' })
}

export async function addItemsToPlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json()
  const uris = body.uris
  const position = body.position || 0

  await addTracksToPlaylistInSupabase(id, uris, user.id)

  c.status(201)
  return c.json({ message: 'Tracks added successfully' })
}

export async function fetchPlaylistItems(c: Context): Promise<any> {
  const id = c.req.param('id')

  const playlist = await getSupabasePlaylistById(id)

  if (!playlist) {
    c.status(500)
    return c.text('Failed to fetch Spotify playlists')
  }

  if (playlist.tracks.length !== 0) {
    const spotify_token = c.get('spotify_token')
    const trackIds = playlist.tracks.map((track: any) => track.spotify_id)
    const spotifyTracksData = await fetchSpotifyTracks(spotify_token, trackIds)

    if (spotifyTracksData.error) {
      c.status(spotifyTracksData.error.status || 500)
      return c.json({ error: spotifyTracksData.error.message || 'Unknown error from Spotify API' })
    }

    playlist.tracks = playlist.tracks.map((track: any) => {
      const spotifyTrack = spotifyTracksData.tracks.find((t: any) => t.uri === track.spotify_id);
      return {
        ...track,
        details: spotifyTrack || null
      };
    });
  }

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

  await deletePlaylistInSupabase(id)

  c.status(200)
  return c.json({ message: 'Playlist deleted successfully' })
}

export async function updatePlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const body = await c.req.json()

  const validatedPayload = validateEditPlaylistPayload(body);

  await editPlaylistSupabaseById(id, validatedPayload);
  c.status(200)
  return c.json({ message: 'Playlist updated successfully' })
}

