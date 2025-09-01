import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'

const functionName = 'search'
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
  }w
})

app.onError((err, c) => {
  //console.error('Error occurred:', err)
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
})

app.get('/', async (c) => {
  const spotify_token = c.get('spotify_token')
  const { q, type, limit, offset } = c.req.query()

  const res = await fetchSpotifySearch(spotify_token, { q, type, limit, offset })

  if (!res) {
    throw new HTTPException(500, 'Failed to fetch Spotify playlists')
  }

  c.status(200)
  return c.json(res)
})

async function getUserToken(user_id: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)

  if (error || !data) {
    throw new HTTPException(500, 'Failed to fetch user data')
  }

  console.log('User Spotify token:', data[0].spotify_access_token);
  return data[0].spotify_access_token
}

async function fetchSpotifySearch(
  spotify_token: string,
  params: { q: string; type: string; limit?: string; offset?: string }
): Promise<any> {
  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.append('q', params.q);
  url.searchParams.append('type', params.type);
  if (params.limit) url.searchParams.append('limit', params.limit);
  if (params.offset) url.searchParams.append('offset', params.offset);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    }
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
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data) {
    throw new HTTPException(401, 'Unauthorized: Invalid token');
  }

  return data.user;
}
