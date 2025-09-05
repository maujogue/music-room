import { Context } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUserPlaylists } from './service.ts'

export async function fetchCurrentUserPlaylists(c: Context): Promise<Response> {
  try {
    const spotify_token = c.get('spotify_token')
    const playlists = await getCurrentUserPlaylists(spotify_token)

    if (!playlists) {
      throw new HTTPException(500, { message: 'Failed to fetch Spotify playlists' })
    }

    return c.json(playlists)
  } catch (error) {
    console.error('Error fetching current user playlists:', error)
    throw new HTTPException(500, { message: 'Internal server error' })
  }
}
