import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'

const functionName = 'playlists'
const app = new Hono().basePath(`/${functionName}`)

const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SECRET_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
const base_url = Deno.env.get('EXPO_PUBLIC_SUPABASE_URL') || 'http://localhost:54321'

serve(app.fetch)

app.use('*', async (c, next) => {
  const user = await getCurrentUser(c.req)
  c.set('user', user)
  await next()
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

async function fetchPlaylistItems(c: Context): Promise<any> {
  const id = c.req.param('id')
  const user_data = c.get('user')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_data.user.id)

  if (error || !data) {
    c.status(500)
    return c.text('Failed to fetch Spotify token')
  }

  const playlist_items = await fetchSpotifyPlaylistItems(data[0].spotify_access_token, id)

  if (!playlist_items) {
    c.status(500)
    return c.text('Failed to fetch Spotify playlists')
  }

  c.status(200)
  return c.json(playlist_items)
}

async function fetchSpotifyPlaylistItems(spotify_token: string, id: string): Promise<any> {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
  });
  return response.json();
}

export async function getCurrentUser(req: Request): Promise<any> {
  const authHeader = req.header('Authorization') || req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No Authorization header or invalid format');
    throw new HTTPException(401, { message: 'Unauthorized: No token provided'});
  }

  const token = authHeader.substring(7);
  const { data: user, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new HTTPException(401, 'Unauthorized: Invalid token');
  }

  return user;
}
