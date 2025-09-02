import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'

const functionName = 'playlists'
const app = new Hono().basePath(`/${functionName}`)

const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SECRET_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
const base_url = Deno.env.get('EXPO_PUBLIC_SUPABASE_URL') || 'http://localhost:54321'

serve(app.fetch)

app.use('*', async (c, next) => {
  try {
    const user = await getCurrentUser(c.req)
    const token = await getUserToken(user.id)
    c.set('user', user)
    c.set('spotify_token', token)
    await next()
  } catch (err) {
    console.log('Authentication error:', err)
    return c.json({ error: err.message }, 401)
  }
})

app.onError((err, c) => {
  console.error('Error occurred:', err)
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
})

app.get('/:id/tracks', async (c) => {
  return fetchPlaylistItems(c)
})

app.post('/:id/tracks', async (c) => {
  return addItemsToPlaylist(c)
})

async function addItemsToPlaylist(c: Context): Promise<any> {
  const id = c.req.param('id')
  const spotify_access_token = c.get('spotify_token')
  const body = await c.req.json()
  const uris = body.uris
  const position = body.position || 0

  const res = await postItemsToSpotifyPlaylist(spotify_access_token, id, { uris, position })
  if (!res) {
    console.error('Failed to add items to Spotify playlist')
    throw new HTTPException(500, 'Failed to add items to Spotify playlist')
  }

  c.status(201)
  return c.json(res)
}

async function fetchPlaylistItems(c: Context): Promise<any> {
  const id = c.req.param('id')
  const spotify_access_token = c.get('spotify_token')

  const playlist_items = await fetchSpotifyPlaylistItems(spotify_access_token, id)

  if (!playlist_items) {
    c.status(500)
    return c.text('Failed to fetch Spotify playlists')
  }

  c.status(200)
  return c.json(playlist_items)
}

async function postItemsToSpotifyPlaylist(
  spotify_token: string,
  id: string,
  body: { uris: string[], position?: number }): Promise<any> {

  const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${spotify_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

async function fetchSpotifyPlaylistItems(spotify_token: string, id: string): Promise<any> {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
  });
  return response.json();
}
