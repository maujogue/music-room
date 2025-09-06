export async function getCurrentUserPlaylists(spotify_token: string): Promise<any> {
  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    }
  });

  return response.json();
}

export async function getCurrentUserPlayingTrack(spotify_token: string): Promise<any> {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    }
  });

  return response.json();
}
