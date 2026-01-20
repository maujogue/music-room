import { HTTPException } from "@hono/http-exception";
import type { SpotifyTrack } from "@track";

export interface SpotifyTracksResponse {
  tracks: SpotifyTrack[];
}

export async function fetchSpotifyTracks(
  spotify_token: string,
  ids: string[],
): Promise<SpotifyTracksResponse> {
  const url = new URL("https://api.spotify.com/v1/tracks");
  url.searchParams.append("ids", ids.join(","));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    throw new HTTPException(response.status, {
      message: `Spotify API returned non-JSON response (${response.status}): ${
        text.slice(0, 100)
      }`,
    });
  }

  const data = await response.json();
  if (!response.ok) {
    throw new HTTPException(response.status, {
      message: data.error?.message || "Unknown error from Spotify API",
    });
  }

  return data as SpotifyTracksResponse;
}
