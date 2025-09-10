import { Context } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import {
  getCurrentUserPlaylists,
  getCurrentUserPlayingTrack,
  startPlayback,
  pausePlayback,
  skipToNextTrack
} from './services/spotify.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('EXPO_PUBLIC_SUPABASE_URL'),
  Deno.env.get('EXPO_PUBLIC_SUPABASE_ANON_KEY')!
);

export async function fetchCurrentUserPlaylists(c: Context): Promise<Response> {
    const spotify_token = c.get('spotify_token')
    const res = await getCurrentUserPlaylists(spotify_token)

    if (!res) {
      throw new HTTPException(500, { message: 'Failed to fetch Spotify playlists' })
    }

    if (res.error) {
      c .status(res.error.status || 500)
      return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
    }

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
      throw new HTTPException(500, { message: 'Failed to start Spotify playback' })
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
      throw new HTTPException(500, { message: 'Failed to pause Spotify playback' })
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
      throw new HTTPException(500, { message: 'Failed to skip to next Spotify track' })
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

export async function updateCurrentUserProfile(c: Context) {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const body = await c.req.parseBody()
  const dataToUpdate = body['updates']
  console.log("body", body)


  console.log("updates", dataToUpdate)
  console.log("user.id", user.id)

  const { data, error } = await supabase
    .from('profiles')
    .update(dataToUpdate)
    .eq('id', user.id)
    .select()

  console.log("error =", error)
  console.log("data =", data)
  if (error) {
    console.error('Error updating profile:', error)
    throw new HTTPException(500, { message: `Error updating profile:', ${error}`})
  }
  c.status(200)
  return c.json({ data, error: null })
}

