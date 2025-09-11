import { Hono } from 'jsr:@hono/hono'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'
import playlistRoutes from './routes.ts'

const app = new Hono()

serve(app.fetch)

app.use('*', async (c, next) => {
  try {
    const user = await getCurrentUser(c.req)
    const token = await getUserToken(user.id)
    c.set('user', user)
    c.set('spotify_token', token)
    await next()
  } catch (err) {
    return c.json({ error: err.message }, 401)
  }
})

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({ message: err.message }, err.status);
  }

  return c.json({
    message: 'Internal Server Error'
  }, 500);
})

app.route('/events', playlistRoutes)

