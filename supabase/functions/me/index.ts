// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';
import { serve } from '@deno/server';
import { HTTPException } from '@hono/http-exception';
import { getCurrentUser, getUserSpotifyToken } from '@auth/utils';
import meRoutes from './routes.ts';
import { Context } from "node:vm";
import type { StatusCode } from "@hono/hono/utils/http-status";

const app = new Hono();

serve(app.fetch);

declare module '@hono/hono' {
  interface ContextVariableMap {
    user: Awaited<ReturnType<typeof getCurrentUser>>;
    spotify_token: Awaited<ReturnType<typeof getUserSpotifyToken>>;
  }
}

app.use('*', async (c: Context, next) => {
  try {
    const user = await getCurrentUser(c.req);
    const token = await getUserSpotifyToken(user.id);
    c.set('user', user);
    c.set('spotify_token', token);
    await next();
  } catch (err) {
    const message = typeof err === 'object' && err !== null && 'message' in err
      ? (err as { message: string }).message
      : String(err);
    return c.json({ error: message }, 401)
  }
});

app.onError((err, c) => {
  console.error('Error occurred:', err);
  if (err instanceof HTTPException) {
    c.status(err.status as StatusCode);
    return c.json({ message: err.message });
  }
  return c.json(
    {
      message: 'Internal Server Error',
    },
    500
  );
});

app.route('/me', meRoutes);

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/me' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
