import {
  getUserPlayingTrack,
  getCurrentUserPlaylists,
  pausePlayback,
  skipToNextTrack,
} from "../../me/services/spotify.ts";

async function getToken() {
  const res = await fetch("http://127.0.0.1:8888/get_access_token");
  const data = await res.json();
  return data.access_token;
}

Deno.test({
  name: "spotify integration: getCurrentUserPlaylists returns playlists",
  fn: async () => {
    const spotifyToken = (await getToken()) ?? "";
    if (!spotifyToken) {
      throw new Error("spotifyToken is required.");
    }
    const result = await getCurrentUserPlaylists(spotifyToken);
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.items || !Array.isArray(result.items)) {
      throw new Error("Result does not contain a playlists array in items");
    }
    if (result.items.length === 0) {
      throw new Error("No playlists returned for this user");
    }

    for (const playlist of result.items) {
      if (!playlist.id || !playlist.name) {
        throw new Error("A playlist is invalid: missing id or name");
      }
    }
  },
});

Deno.test({
  name:
    "spotify integration: getUserPlayingTrack returns valid response",
  fn: async () => {
    const spotifyToken = (await getToken()) ?? "";
    if (!spotifyToken) {
      throw new Error("spotifyToken is required.");
    }
    const result = await getUserPlayingTrack(spotifyToken);

    if (result.error) {
      throw new Error(
        "An error code should not be return by getUserPlayingTrack",
      );
    }
  },
});

Deno.test({
  name: "spotify integration: pausePlayback returns valid response",
  fn: async () => {
    const spotifyToken = (await getToken()) ?? "";
    if (!spotifyToken) {
      throw new Error("spotifyToken is required.");
    }
    const result = await pausePlayback(spotifyToken);
    await result.text();

    if (result.error) {
      throw new Error("An error code should not be return by pausePlayback");
    }
  },
});

Deno.test({
  name: "spotify integration: skipToNextTrack returns valid response",
  fn: async () => {
    const spotifyToken = (await getToken()) ?? "";
    if (!spotifyToken) {
      throw new Error("spotifyToken is required.");
    }
    const result = await skipToNextTrack(spotifyToken);
    await result.text();

    if (result.error) {
      throw new Error("An error code should not be return by skipToNextTrack");
    }
  },
});
