import { assertRejects } from 'https://deno.land/std@0.210.0/testing/asserts.ts';

import {
  fetchSpotifyUserTokenData,
  fetchSpotifyUserProfile,
} from '../functions/auth/services/spotify.ts'; // Remplace par le bon chemin

// Mock Deno.env.get
const mockEnv = new Map<string, string>([
  ['EXPO_PUBLIC_SUPABASE_URL', 'https://example.supabase.co'],
  ['SPOTIFY_CLIENT_ID', 'fake_client_id'],
  ['SPOTIFY_CLIENT_SECRET', 'fake_client_secret'],
]);

// Mock fetch global
globalThis.fetch = async (url: string, options: RequestInit) => {
  if (url === 'https://accounts.spotify.com/api/token') {

    const body = options.body?.toString() ?? '';
    if (body.includes('wrong_code')) {
      return new Response('Invalid authorization code', { status: 400 });
    }

    return new Response(
      JSON.stringify({
        access_token: 'mock_access_token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'mock_refresh_token',
        scope: 'user-read-private user-read-email',
      }),
      { status: 200 }
    );
  }

  if (url === 'https://api.spotify.com/v1/me') {
    return new Response(
      JSON.stringify({
        display_name: 'Mock User',
        email: 'mock@example.com',
        id: 'mock_user_id',
      }),
      { status: 200 }
    );
  }

  return new Response('Not Found', { status: 404 });
};

Deno.env.get = (key: string): string | undefined => mockEnv.get(key);

// -------------------- TESTS ------------------------

Deno.test('fetchSpotifyUserTokenData should return token data', async () => {
  const code = 'mock_auth_code';
  const data = await fetchSpotifyUserTokenData(code);

  if (!data.access_token || data?.access_token !== 'mock_access_token') {
    throw new Error('Access token not returned correctly');
  }

  if (data?.refresh_token !== 'mock_refresh_token') {
    throw new Error('Refresh token not returned correctly');
  }
});


Deno.test('fetchSpotifyUserTokenData should throw an invalid code', async () => {
  const code = 'wrong_code';
  let errorCaught = false;

  try {
    await fetchSpotifyUserTokenData(code);
  } catch (err) {
    errorCaught = true;
    if (!err.message.includes('Error fetching access token')) {
      throw new Error('Unexpected error message: ' + err.message);
    }
  }

  if (!errorCaught) {
    throw new Error('Expected error was not thrown');
  }
});


Deno.test('fetchSpotifyUserProfile should return user profile', async () => {
  const mockAccessToken = 'mock_access_token';
  const mockUserData = {
    id: 'user123',
    display_name: 'Test User',
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, _options) =>
    Promise.resolve({
      ok: true,
      json: async () => mockUserData,
    } as Response);

  const data = await fetchSpotifyUserProfile(mockAccessToken);
	console.log(data)
  console.assert(data.id === 'user123', 'User ID should match');
  console.assert(data.display_name === 'Test User', 'Display name should match');

  globalThis.fetch = originalFetch;
});

Deno.test('fetchSpotifyUserProfile should throw error on bad response', async () => {
  const mockAccessToken = 'invalid_token';
  const mockErrorText = 'Invalid token';

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, _options) =>
    Promise.resolve({
      ok: false,
      text: async () => mockErrorText,
    } as Response);

  let caughtError: Error | null = null;

  try {
    await fetchSpotifyUserProfile(mockAccessToken);
  } catch (e) {
    caughtError = e as Error;
  }

  console.assert(
    caughtError?.message === 'Error fetching user profile: ' + mockErrorText,
    'Should throw expected error message'
  );

  globalThis.fetch = originalFetch;
});



