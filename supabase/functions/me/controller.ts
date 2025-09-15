import { Context } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import {
  getCurrentUserPlaylists,
  getCurrentUserPlayingTrack,
  startPlayback,
  pausePlayback,
  skipToNextTrack
} from './services/spotify.ts'
import {
  getSupabasePlaylistByOwner,
  getSupabaseEventByOwner
} from './services/supabase.ts'

export async function fetchCurrentUserPlaylists(c: Context): Promise<Response> {
    const user = c.get('user')
    console.log('Fetching playlists for user:', user)
    const res = await getSupabasePlaylistByOwner(user.id)

    c.status(200)
    return c.json(res)
}

export async function fetchCurrentUserPlayingTrack(c: Context): Promise<Response> {
    const spotify_token = c.get('spotify_token')
    const res = await getCurrentUserPlayingTrack(spotify_token)

    if (!res) {
      throw new HTTPException(500, { message: 'Failed to fetch Spotify currently playing track' })
    }

    if (res.error) {
      c .status(res.error.status || 500)
      return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
    }

    if (res.status === 204) {
      c.status(204)
      return c.body(null)
    }

    c.status(200)
    return c.json(res)
}

export async function startUserPlayback(c: Context): Promise<Response> {
    const spotify_token = c.get('spotify_token')
    const body = await c.req.json()
    const res = await startPlayback(spotify_token, body)

    if (!res) {
      c.status(500)
      return c.json({ error: 'Failed to start Spotify playback' })
    }

    console.log('Response from startPlayback:', res);
    if (res.error || !res.ok) {
      console.error('Error from Spotify API:', res.error);
      if (res.error) {
        c.status(res.status || 500)
        return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
      }
      c.status(res.status || 500)
      return c.json({ error: res.statusText || 'Unknown error from Spotify API' })
    }

    c.status(204)
    return c.body(null)
}

export async function pauseUserPlayback(c: Context): Promise<Response> {
    const spotify_token = c.get('spotify_token')
    const res = await pausePlayback(spotify_token)

    if (!res) {
      c.status(500)
      return c.json({ error: 'Failed to pause Spotify playback' })
    }
    if (res.error) {
      c .status(res.error.status || 500)
      return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
    }

    c.status(200)
    return c.json(res)
}

export async function skipToNextUserTrack(c: Context): Promise<Response> {
    const spotify_token = c.get('spotify_token')
    const res = await skipToNextTrack(spotify_token)

    if (!res) {
      c.status(500)
      return c.json({ error: 'Failed to skip to next Spotify track' })
    }
    if (res.error || !res.ok) {
      console.error('Error from Spotify API:', res.error);
      if (res.error) {
        c.status(res.status || 500)
        return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
      }
      c.status(res.status || 500)
      return c.json({ error: res.statusText || 'Unknown error from Spotify API' })
    }

    c.status(204);
    return c.body(null);
}

export async function fetchCurrentUserEvents(c: Context): Promise<any> {
  const user = c.get('user')

  const events = await getSupabaseEventByOwner(user.id)
  if (!events) {
    throw new HTTPException(500, { message: 'Failed to fetch events' })
  }

  return c.json(events)
}
