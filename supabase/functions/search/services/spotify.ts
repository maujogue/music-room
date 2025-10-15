export async function fetchSpotifySearch(
  spotify_token: string,
  params: { query: string; type: string; limit?: string; offset?: string }
): Promise<any> {
  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.append('q', params.query);
  url.searchParams.append('type', params.type);
  if (params.limit) url.searchParams.append('limit', params.limit);
  if (params.offset) url.searchParams.append('offset', params.offset);

  console.log('Fetching Spotify search with params:', params);
  console.log('Fetching Spotify search with URL:', url.toString());
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Error fetching Spotify search: ' + errorText);
  }
  return response.json();
}
