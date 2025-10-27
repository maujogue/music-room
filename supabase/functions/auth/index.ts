import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserSpotifyToken } from './utils.ts'
import authRoutes from './routes.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const app = new Hono()

serve(app.fetch)

app.use('*', async (c, next) => {
  try {
    if (c.req.url.includes('/spotify/callback')) {
      return await next()
    }
    const user = await getCurrentUser(c.req)
    c.set('user', user)
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


  console.error('Error occurred:', err);
  return c.json({
    message: 'Internal Server Error'
  }, 500);
})

app.route('/auth', authRoutes)
