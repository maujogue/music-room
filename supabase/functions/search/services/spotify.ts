export async function fetchSpotifySearch(
  spotify_token: string,
  params: { q: string; type: string; limit?: string; offset?: string }
): Promise<any> {
  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.append('q', params.q);
  url.searchParams.append('type', params.type);
  if (params.limit) url.searchParams.append('limit', params.limit);
  if (params.offset) url.searchParams.append('offset', params.offset);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    }
  });
  return response.json();
}
