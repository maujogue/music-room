import { Hono } from '@hono/hono'
import { serve } from '@deno/server'
import { HTTPException } from '@hono/http-exception';
import { getCurrentUser, getUserSpotifyToken } from '@auth/utils'
import playlistRoutes from './routes.ts'
import type { StatusCode } from "@hono/hono/utils/http-status";

const app = new Hono()

serve(app.fetch)

declare module '@hono/hono' {
  interface ContextVariableMap {
    user: Awaited<ReturnType<typeof getCurrentUser>>;
    spotify_token: Awaited<ReturnType<typeof getUserSpotifyToken>>;
  }
}
app.use('*', async (c, next) => {
  try {
    const user = await getCurrentUser(c.req)
    const token = await getUserSpotifyToken(user.id)
    c.set('user', user)
    c.set('spotify_token', token)
    await next()
  } catch (err) {
    const message = typeof err === 'object' && err !== null && 'message' in err
      ? (err as { message: string }).message
      : String(err);
    return c.json({ error: message }, 401)
  }
})

app.onError((err, c) => {
  console.error('Error occurred:', err);
  if (err instanceof HTTPException) {
    c.status(err.status as StatusCode);
    return c.json({ message: err.message });
  }
  return c.json({
    message: 'Internal Server Error'
  }, 500);
})

app.route('/playlists', playlistRoutes)
