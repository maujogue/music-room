// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCurrentUser } from '../auth.ts';

const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SECRET_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const base_url = Deno.env.get('API_BASE_URL') || 'http://localhost:54321';

Deno.serve(async (req) => {
	const url = req.url;
  if (url.includes('/playlists')) {
      return fetchCurrentUserPlaylists(req);
    }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

async function fetchCurrentUserPlaylists(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    console.log('Invalid method:', req.method);
	  return new Response('Method Not Allowed', { status: 405 });
  }

  const user_data = await getCurrentUser(req);
  if (!user_data) {
    console.log('Unauthorized request: no user');
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('Authenticated user:', user_data.user.id);
  const { data, error } = await supabase.from('profiles')
        .select('*')
        .eq('id', user_data.user.id);

  if (error || !data) {
    console.error('Error fetching user from database:', error);
    return new Response('Failed to fetch Spotify token', { status: 500 });
  }

  const playlists = await fetchSpotifyUserPlaylists(data[0].spotify_access_token);
  if (!playlists) {
    console.error('Error fetching playlists from Spotify');
    return new Response('Failed to fetch Spotify playlists', { status: 500 });
  }

  return new Response(
    JSON.stringify(playlists),
    { headers: { "Content-Type": "application/json" } },
  );
}

async function fetchSpotifyUserPlaylists(spotify_token: string): Promise<any> {
	const response = await fetch('https://api.spotify.com/v1/me/playlists', {
		headers: {
			'Authorization': `Bearer ${spotify_token}`
		}
	});
	return response.json();
}


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/me' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
