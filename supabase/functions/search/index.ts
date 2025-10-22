import * as Hono from '@hono/hono'
import { createClient } from '@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserSpotifyToken } from '../auth.ts'
import searchRoutes from './routes.ts'
import type { StatusCode } from '@hono/hono/utils/http-status'

const app = new Hono.Hono()

serve(app.fetch)

app.use('*', async (c: Hono.Context, next) => {
  try {
    const user = await getCurrentUser(c.req)
    const token = await getUserSpotifyToken(user.id)
    c.set('user', user)
    c.set('spotify_token', token)
    await next()
  } catch (err) {
    console.log('Authentication error:', err)
    return c.json({ error: err.message }, 401)
  }
})

app.onError((err: Error, c: Hono.Context) => {
  console.error('Error occurred:', err)
  if (err instanceof HTTPException) {
    console.error('HTTPException details:', err.status, err.message);
    c.status(err.status as StatusCode);
    return c.json({ message: err.message});
  }
  return c.json({ error: 'Internal Server Error', status: 500 });
})

app.route('/search', searchRoutes)
