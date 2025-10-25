import {
  getCurrentUserPlaylists,
  getCurrentUserPlayingTrack,
  startPlayback,
  pausePlayback,
  skipToNextTrack,
} from '../../functions/me/services/spotify.js';

import 'jsr:@std/dotenv/load'

const spotifyToken = Deno.env.get('TEST_SPOTIFY_TOKEN') ?? '';
if (!spotifyToken) {
    throw new Error('spotifyToken is required.');
};


Deno.test('getCurrentUserPlaylists returns playlists', async () => {
  const result = await getCurrentUserPlaylists(spotifyToken);
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.items || !Array.isArray(result.items)) {
    throw new Error('Result does not contain a playlists array in items');
  }
  if (result.items.length === 0) {
    throw new Error('No playlists returned for this user');
  }

  for (const playlist of result.items) {
    if (!playlist.id || !playlist.name) {
      throw new Error('A playlist is invalid: missing id or name');
    }
  }
});


Deno.test('getCurrentUserPlaylists returns invalid acces token error', async () => {
  const result = await getCurrentUserPlaylists('invalid_token');

  if (!result.error) {
    throw new Error('An error code should be return by getCurrentUserPlaylists');
  }
});



Deno.test('getCurrentUserPlayingTrack returns invalid acces token error', async () => {
  const result = await getCurrentUserPlayingTrack('invalid_token');

  if (!result.error) {
    throw new Error('An error code should be return by getCurrentUserPlayingTrack');
  }
});

Deno.test('getCurrentUserPlayingTrack returns permission missing error', async () => {
  const result = await getCurrentUserPlayingTrack(spotifyToken);

  if (!result.error) {
    throw new Error('An error code should be return by getCurrentUserPlayingTrack');
  }
});

Deno.test('pausePlayback returns invalid acces token error', async () => {
  const result = await pausePlayback(`invalid_token`);
	await result.text();

	if (result['status'] !== 401 && result['statusText'] !== 'Unauthorized') {
    throw new Error('This test expects a 401 status code');
  }
});

Deno.test('skipToNextTrack returns invalid acces token error', async () => {
  const result = await skipToNextTrack(`invalid_token`);
	await result.text();

	if (result['status'] !== 401 && result['statusText'] !== 'Unauthorized') {
    throw new Error('This test expects a 401 status code');
  }
});

Deno.test('pausePlayback returns invalid acces token error', async () => {
  const result = await pausePlayback(spotifyToken);
	await result.text();

	if (result['status'] !== 403 && result['statusText'] !== 'Forbidden') {
    throw new Error('This test expects a 403 status code');
  }
});

Deno.test('skipToNextTrack returns invalid acces token error', async () => {
  const result = await skipToNextTrack(spotifyToken);
	await result.text();

	if (result['status'] !== 403 && result['statusText'] !== 'Forbidden') {
    throw new Error('This test expects a 403 status code');
  }
});

