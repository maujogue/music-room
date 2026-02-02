export async function getCurrentUserPlaylists(
  spotify_token: string,
): Promise<any> {
  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
  });

  return response.json();
}

export async function getCurrentUserPlayingTrack(
  spotify_token: string,
): Promise<any> {
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotify_token}`,
      },
    },
  );

  if (response.status === 204) {
    return response;
  }
  return response.json();
}

export async function startPlayback(
  spotify_token: string,
  body?: { uris: string[] },
  deviceId?: string,
): Promise<any> {
  console.log("Starting playback with device ID:", deviceId);
  const response = await fetch(`https://api.spotify.com/v1/me/player/play${deviceId ? `?device_id=${deviceId}` : ""}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
    body: JSON.stringify(body),
  });

  console.log("Start playback response status:", response);
  return response;
}

export async function pausePlayback(spotify_token: string): Promise<any> {
  const response = await fetch("https://api.spotify.com/v1/me/player/pause", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
  });

  return response;
}

export async function skipToNextTrack(spotify_token: string): Promise<any> {
  const response = await fetch("https://api.spotify.com/v1/me/player/next", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
  });

  return response;
}

export async function getAvailableDevicesSpotify(spotify_token: string): Promise<any> {
  const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
    method: "GET",
    headers: {Authorization: `Bearer ${spotify_token}`,
    },
  });

  console.log("Devices response status:", response);
  return response.json();
}