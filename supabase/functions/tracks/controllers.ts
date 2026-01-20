import { fetchSpotifyTracks } from "./services/spotify.ts";
import { HTTPException } from "@hono/http-exception";
import { Context } from "@hono/hono";
import type { SpotifyTrack } from "@track";

export async function getTracks(c: Context) {
  const spotify_token = c.get("spotify_token");
  const { ids } = c.req.query();

  if (!ids) {
    c.status(400);
    return c.json({ error: 'Query parameter "ids" is required' });
  }

  // Comma separated list of IDs
  const idList = ids.split(",").map((id) => {
    let cleanId = id.trim();
    if (cleanId.startsWith("spotify:track:")) {
      cleanId = cleanId.replace("spotify:track:", "");
    }
    return cleanId;
  }).filter((id) => id.length > 0);

  if (idList.length === 0) {
    return c.json({ tracks: [] });
  }

  // Spotify allows max 50 ids per request.
  // For now assuming we are under limit or user will paginate client side if needed,
  // but let's slice just in case to be safe blindly.
  const safeIdList = idList.slice(0, 50);

  const res = await fetchSpotifyTracks(spotify_token, safeIdList);

  // No error handling needed here as fetchSpotifyTracks throws HTTPException which is caught by global error handler

  return c.json({
    tracks: res.tracks,
  });
}
