import { HTTPException } from "@hono/http-exception";
import type { SpotifyTrackResponse } from "@track";

export async function fetchSpotifySearch(
  spotify_token: string,
  params: { query: string; type: string; limit?: string; offset?: string },
): Promise<SpotifyTrackResponse> {
  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.append("q", params.query);
  url.searchParams.append("type", params.type);
  if (params.limit) url.searchParams.append("limit", params.limit);
  if (params.offset) url.searchParams.append("offset", params.offset);

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

  return data as SpotifyTrackResponse;
}
