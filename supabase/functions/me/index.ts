// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { Hono } from 'jsr:@hono/hono'
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { getCurrentUser, getUserToken } from '../auth.ts';
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import meRoutes from './routes.ts';

const functionName = "me"
const app = new Hono().basePath(`/${functionName}`)

serve(app.fetch);

app.use('*', async (c, next) => {
  try {
    console.log('Authenticating request...');
    // console.log('url:', c.req.url);
    // console.log('method:', c.req.method);
    // console.log('headers:', JSON.stringify(c.req.headers, null, 2));
    const user = await getCurrentUser(c.req);
    const token = await getUserToken(user.id);
    c.set('user', user);
    c.set('spotify_token', token);
    await next();
  } catch (err) {
    return c.json({ error: err.message }, 401);
  }
});

app.onError((err, c) => {
  console.error('Error occurred:', err);
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json(
    {
      message: 'Internal Server Error',
          },
    500
  );
});


app.put('/profile', async (c) => {

  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const { userId, updates } = await c.req.json()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw new HTTPException(500, { message: `Error updating profile:', ${error}`})
  }
  c.status(200)
  return c.json({ data, error: null })
})


app.route('/me', meRoutes);

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/me' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
