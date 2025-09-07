import { Context } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUserPlaylists } from './service.ts'

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

    console.log('Fetched user playlists:', res)
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

    console.log('Fetched user currently playing track:', res)
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

    if (res.error) {
      c .status(res.error.status || 500)
      return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
    }

    console.log('Started user playback:', res)
    c.status(200)
    return c.json(res)
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

    console.log('Paused user playback:', res)
    c.status(200)
    return c.json(res)
}

export async function skipToNextUserTrack(c: Context): Promise<Response> {
    const spotify_token = c.get('spotify_token')
    const res = await skipToNextTrack(spotify_token)

    if (!res) {
      throw new HTTPException(500, { message: 'Failed to skip to next Spotify track' })
    }
    if (res.error) {
      c .status(res.error.status || 500)
      return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
    }

    console.log('Skipped to next user track:', res)
    c.status(200)
    return c.json(res)
}

