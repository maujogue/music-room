// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateRandomString } from './utils.ts';
import { SupabaseError } from './supabase_error.ts';

const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SECRET_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const base_url = Deno.env.get('API_BASE_URL') || 'http://localhost:54321';
const redirect_uri = `${base_url}/functions/v1/auth/spotify/callback`;
const client_id = Deno.env.get('SPOTIFY_CLIENT_ID')!;
const client_secret = Deno.env.get('SPOTIFY_CLIENT_SECRET')!;

Deno.serve(async (req, res) => {
  const url = req.url;

  try {
    if (url.includes('/spotify/callback')) {
      return handleSpotifyCallback(req, res);
    }
    if (url.includes('/spotify')) {
      return handleSpotifyAuth(req, res);
    }

    return new Response('blc', {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof SupabaseError) {
      console.error('SupabaseError:', error.message);
      return new Response('Error handling request: ' + error.message, {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error('Error:', error);
    return new Response('Error handling request: ' + error.message, {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function handleSpotifyAuth(
  req: Request,
  res: Response
): Promise<Response> {
  var state = generateRandomString(16);
  var scope =
    ' \
		user-read-private \
		user-read-email \
		user-read-playback-state \
		user-modify-playback-state \
		user-read-currently-playing \
		playlist-read-private \
		playlist-modify-private';

  const { error } = await supabase.from('oauth_state').insert([{ state }]);
  if (error) {
    throw new SupabaseError('Error inserting OAuth state: ' + error.message);
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });

  const headers = new Headers();
  headers.set(
    'Location',
    'https://accounts.spotify.com/authorize?' + params.toString()
  );
  return new Response(null, {
    status: 302,
    headers: headers,
  });
}

async function handleSpotifyCallback(
  req: Request,
  res: Response
): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const spotifyError = url.searchParams.get('error');

  if (spotifyError) {
    if (spotifyError === 'access_denied') {
      return new Response('Access denied', { status: 403 });
    }
    console.error('Spotify error:', spotifyError);
    return new Response('Error handling request: ' + spotifyError, {
      status: 500,
    });
  }
  const { data, error } = await supabase
    .from('oauth_state')
    .select('*')
    .eq('state', state);
  if (error) {
    throw new SupabaseError('Error fetching OAuth state: ' + error.message);
  }

  if (!data) {
    return new Response('Invalid state', { status: 400 });
  }

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from('oauth_state')
    .delete()
    .eq('state', state);

  if (deleteError) {
    throw new SupabaseError(
      'Error deleting OAuth state: ' + deleteError.message
    );
  }

  return await fetchSpotifyUserToken(code);
}

async function fetchSpotifyUserToken(code: string): Promise<Response> {
  const bodyParams = new URLSearchParams();
  bodyParams.append('code', code);
  bodyParams.append('redirect_uri', redirect_uri);
  bodyParams.append('grant_type', 'authorization_code');

  const authHeader = 'Basic ' + btoa(client_id + ':' + client_secret);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authHeader,
    },
    body: bodyParams.toString(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Error fetching access token: ' + errorText);
  }

  const json_data = await response.json();

  const user_profile_data = await fetchSpotifyUserProfile(
    json_data.access_token
  );

  if (user_profile_data) {
    let user: any;

    if (!(await checkIfAuthUserAlreadyExist(user_profile_data.email))) {
      user = await createAuthUser(user_profile_data).then((res) => res.user);
    } else {
      user = await supabase
        .from('users')
        .select('*')
        .eq('email', user_profile_data.email)
        .single()
        .then((res) => res.data);
    }
    await upsertUser(user.id, user.email, json_data);
  }

  return new Response(
    JSON.stringify({ message: 'User authenticated successfully' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

async function upsertUser(
  user_id: string,
  user_email: string,
  spotify_token_data: any
): Promise<void> {
  await supabase.from('users').upsert({
    id: user_id,
    email: user_email,
    spotify_access_token: spotify_token_data.access_token,
    spotify_refresh_token: spotify_token_data.refresh_token,
    spotify_token_expires_at: spotify_token_data.expires_in
      ? new Date(Date.now() + spotify_token_data.expires_in * 1000)
      : null,
  });
}

async function createAuthUser(userData: any): Promise<any> {
  const spotifyUser = {
    id: userData.id,
    email: userData.email,
    displayName: userData.displayName,
  };

  const { data, error } = await supabase.auth.admin.createUser({
    email: spotifyUser.email,
    email_confirm: true,
    password: crypto.randomUUID(),
    user_metadata: {
      spotify_id: spotifyUser.id,
      display_name: spotifyUser.displayName,
    },
  });

  if (error) {
    throw new SupabaseError('Error creating auth user: ' + error.message);
  }
  return data;
}

async function checkIfAuthUserAlreadyExist(
  userEmail: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', userEmail);

  if (error) {
    throw new SupabaseError(
      'Error checking if auth user exists: ' + error.message
    );
  }

  return data.length !== 0;
}

async function fetchSpotifyUserProfile(access_token: string): Promise<any> {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Error fetching user profile: ' + errorText);
  }
  return await response.json();
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/auth' \
	--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
	--header 'Content-Type: application/json' \
	--data '{"name":"Functions"}'

*/
