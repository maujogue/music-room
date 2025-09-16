import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'


export async function fetchSpotifyUserProfile(spotify_token: string): Promise<any> {
	const response = await fetch('https://api.spotify.com/v1/me', {
	  headers: {
		Authorization: `Bearer ${spotify_token}`,
	  },
	});
	return response.json();
}

export async function fetchSpotifyTracks(spotify_token: string, track_ids: string[]): Promise<any> {
  const idsParam = track_ids
    .map(id => id.trim().replace(/^spotify:track:/i, ''))
    .join(',');
  const url = `https://api.spotify.com/v1/tracks?ids=${idsParam}`;
  console.log('Fetching tracks from URL:', url);
  const response = await fetch(`https://api.spotify.com/v1/tracks?ids=${idsParam}`, {
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
  });
  return await response.json();
}

export async function createSpotifyPlaylist(
	spotify_token: string,
	user_id: string,
	body: {name: string, description: string, public: boolean, collaborative: boolean}): Promise<any> {
	  const response = await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
		method: 'POST',
		headers: {
		  Authorization: `Bearer ${spotify_token}`,
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	  });
	  return response.json();
}

export async function postItemsToSpotifyPlaylist(
  spotify_token: string,
  id: string,
  body: { uris: string[], position?: number }): Promise<any> {

    const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${spotify_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  export async function deleteItemsFromSpotifyPlaylist(spotify_token: string, id: string, body: { uris: string[] }): Promise<any> {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${spotify_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  export async function fetchSpotifyPlaylist(spotify_token: string, id: string): Promise<any> {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: {
        Authorization: `Bearer ${spotify_token}`,
      },
    });
    return response.json();
}
