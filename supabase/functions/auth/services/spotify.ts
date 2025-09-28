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

  return await response.json();
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
