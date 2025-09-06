import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'

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
  }
})

app.onError((err, c) => {
  console.error('Error occurred:', err)
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.get('/', async (c) => {
  const spotify_token = c.get('spotify_token')
  const { q, type, limit, offset } = c.req.query()

  if (type === "user") {
    const users_array = await getUsernamesList(q)
    console.log("Users array = ", users_array)

    c.status(200)
    return c.json({status: 200, data: users_array})
  }

  const res = await fetchSpotifySearch(spotify_token, { q, type, limit, offset })
  if (!res) {
    const errorResponse = new Response('Failed to fetch Spotify playlists', { status: 500 });
    throw new HTTPException(500, { res: errorResponse });
  }
  if (res.error) {
    c.status(res.error.status || 500)
    return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
  }

  c.status(200)
  return c.json(res)
})


async function getUsernamesList(input: string): Promise<string[] | null> {
  if (!input) {
    return c.json({ error: "username parameter is required" }, 400);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `${input}%`);

  if (data && data.length > 0) {
    const filtered_data = data.map(user => ({
      username: user.username,
      avatar_url: user.avatar_url,
      bio: user.bio
    }));
    return filtered_data
  }
  return null
}


async function getUserToken(user_id: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)

  if (error || !data) {
    throw new HTTPException(500, 'Failed to fetch user data')
  }

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


