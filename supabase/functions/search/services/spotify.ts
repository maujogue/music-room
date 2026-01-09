import { HTTPException } from '@hono/http-exception';
import type { SpotifyTrackResponse } from '@track';

export async function fetchSpotifySearch(
  spotify_token: string,
  params: { query: string; type: string; limit?: string; offset?: string }
): Promise<SpotifyTrackResponse> {
  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.append('q', params.query);
  url.searchParams.append('type', params.type);
  if (params.limit) url.searchParams.append('limit', params.limit);
  if (params.offset) url.searchParams.append('offset', params.offset);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new HTTPException(response.status, { message: errorData.error.message || 'Unknown error from Spotify API' });
  }
  return response.json() as Promise<SpotifyTrackResponse>;
}
