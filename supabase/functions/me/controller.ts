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



