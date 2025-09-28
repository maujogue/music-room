// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from 'https://deno.land/x/hono@v3.12.11/mod.ts';
import { cors } from 'https://deno.land/x/hono@v3.12.11/middleware.ts';
import { SupabaseError } from './supabase_error.ts';
import { handleSpotifyAuth, handleSpotifyCallback } from './controller.ts';

const routes = new Hono();

routes.post('/spotify', handleSpotifyAuth);
routes.get('/spotify/callback', handleSpotifyCallback);

export default routes;
