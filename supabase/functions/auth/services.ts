import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SupabaseError } from './supabase_error.ts';

const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SECRET_SERVICE_ROLE_KEY')!;
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const base_url = Deno.env.get('EXPO_PUBLIC_SUPABASE_URL') || 'http://localhost:54321';
const redirect_uri = `${base_url}/functions/v1/auth/spotify/callback`;
const client_id = Deno.env.get('SPOTIFY_CLIENT_ID')!;
const client_secret = Deno.env.get('SPOTIFY_CLIENT_SECRET')!;

export async function fetchSpotifyUserTokenData(code: string): Promise<void> {
  const bodyParams = new URLSearchParams();
  bodyParams.append('code', code);
  bodyParams.append('redirect_uri', redirect_uri);
  bodyParams.append('grant_type', 'authorization_code');

  const client_id = Deno.env.get('SPOTIFY_CLIENT_ID')!;
  const client_secret = Deno.env.get('SPOTIFY_CLIENT_SECRET')!;
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

  const user_profile_data = await fetchSpotifyUserProfile(json_data.access_token);

  if (user_profile_data) {
    let user: any;

    if (!(await checkIfAuthUserAlreadyExist(user_profile_data.email))) {
      user = await createAuthUser(user_profile_data).then((res) => res.user);
    } else {
      user = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user_profile_data.email)
        .single()
        .then((res) => res.data);
    }
    await upsertUser(user.id, user.email, json_data);
  }
}

export async function upsertUser(
  user_id: string,
  user_email: string,
  spotify_token_data: any
): Promise<void> {
  await supabase.from('profiles').upsert({
    id: user_id,
    email: user_email,
    spotify_access_token: spotify_token_data.access_token,
    spotify_refresh_token: spotify_token_data.refresh_token,
    spotify_token_expires_at: spotify_token_data.expires_in
      ? new Date(Date.now() + spotify_token_data.expires_in * 1000)
      : null,
  });
}

export async function createAuthUser(userData: any): Promise<any> {
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

export async function checkIfAuthUserAlreadyExist(userEmail: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', userEmail);

  if (error) {
    throw new SupabaseError(
      'Error checking if auth user exists: ' + error.message
    );
  }

  return data.length !== 0;
}

export async function fetchSpotifyUserProfile(access_token: string): Promise<any> {
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
