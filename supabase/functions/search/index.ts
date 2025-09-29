import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserSpotifyToken } from '../auth.ts'
import searchRoutes from './routes.ts'

const app = new Hono()

serve(app.fetch)

app.use('*', async (c, next) => {
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

app.onError((err, c) => {
  console.error('Error occurred:', err)
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.route('/search', searchRoutes)
