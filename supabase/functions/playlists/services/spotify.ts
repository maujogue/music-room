import { HTTPException } from '@hono/http-exception'
import { 
  PlaylistResponse, 
  SpotifyTrackDetails,
  PlaylistTrack,
  SpotifyPlaylistItemsResponse,
  SpotifyPlaylistItem,
  SpotifyPlaylistResponse
 } from "@playlist";


export async function fetchSpotifyUserProfile(spotify_token: string): Promise<any> {
	const response = await fetch('https://api.spotify.com/v1/me', {
	  headers: {
		Authorization: `Bearer ${spotify_token}`,
	  },
	});
	return response.json();
}

export async function fetchSpotifyTracks(
  spotify_token: string, track_ids: string[]
): Promise<{
  data: SpotifyTrackDetails[];
  error?: { status: number; message: string };
}> 
{
  const idsParam = track_ids
    .map(id => id.trim().replace(/^spotify:track:/i, ''))
    .join(',');
  const url = `https://api.spotify.com/v1/tracks?ids=${idsParam}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
  });

  if (!response.ok) {
    return {
      data: [],
      error: { status: response.status, message: 'Failed to fetch Spotify tracks' }
    };
  }

  const result = await response.json();
  return {
    data: result.tracks as SpotifyTrackDetails[],
    error: result.error ? { status: result.error.status, message: result.error.message } : undefined
  };
}

export async function fetchSpotifyPlaylist(
  spotify_token: string, id: string): Promise<SpotifyPlaylistResponse> 
{
    const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: {
        Authorization: `Bearer ${spotify_token}`,
      },
    });
    if (!response.ok) {
      throw new HTTPException(response.status, { message: 'Failed to fetch Spotify playlist' });
    }
    return response.json();
}

export async function fetchSpotifyPlaylistTracksIds(
  playlist: PlaylistResponse, spotify_token: string): Promise<string[]> 
{
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.spotify_id}/tracks`, {
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
  });
  if (!response.ok) {
    throw new HTTPException(response.status, { message: 'Failed to fetch Spotify playlist tracks' });
  }
  const data = await response.json();
  const spotifyTrackIds = data.items.map((item: SpotifyPlaylistItem) => item.track.id);

  return spotifyTrackIds;
}
