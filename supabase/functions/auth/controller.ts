import { Context } from 'https://deno.land/x/hono@v3.12.11/mod.ts';
import { generateRandomString } from './utils.ts';
import { SupabaseError } from './supabase_error.ts';
import { insertOauthStateToSupabase } from './services/supabase.ts';
import { fetchSpotifyUserTokenData } from './services/spotify.ts';

const client_id = Deno.env.get('SPOTIFY_CLIENT_ID')!;
const base_url = Deno.env.get('EXPO_PUBLIC_SUPABASE_URL') || 'http://localhost:54321';

export async function handleSpotifyAuth(c: Context) {
  const redirect_uri = `${base_url}/functions/v1/auth/spotify/callback`;
  const state = generateRandomString(16);
  const scope = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
  ].join(' ');

  await insertOauthStateToSupabase(state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });

  const spotifyAuthUrl =
    'https://accounts.spotify.com/authorize?' + params.toString();

  c.status(200);
  return c.json({ url: spotifyAuthUrl });
}

export async function handleSpotifyCallback(c: Context) {
  const code = c.req.query('code');
  const state = c.req.query('state');
  const spotifyError = c.req.query('error');

  if (spotifyError) {
    if (spotifyError === 'access_denied') {
      return c.text('Access denied', 403);
    }
    console.error('Spotify error:', spotifyError);
    return c.text('Error handling request: ' + spotifyError, 500);
  }

  const { data, error } = await supabase
    .from('oauth_state')
    .select('*')
    .eq('state', state);
  if (error) {
    throw new SupabaseError('Error fetching OAuth state: ' + error.message);
  }

  if (!data || data.length === 0) {
    return c.text('Invalid state', 400);
  }

  if (!code) {
    return c.text('Missing code', 400);
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

  await fetchSpotifyUserTokenData(code);
  return c.json({ message: 'User authenticated successfully' });
}
