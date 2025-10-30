import { sleep } from "k6";
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { setup_bearer_tokens } from "../utils/setup_bearer_tokens.js";
import { createPlaylist } from "../functions/create_playlist.js";
import { fetchUserPlaylists } from "../functions/fetch_user_playlists.js";
import { loadTestConfig } from "../utils/config.js";

export const options = {
  vus: loadTestConfig.vus,
  duration: loadTestConfig.duration,
};

export function setup() {
  const authData = setup_bearer_tokens(
    loadTestConfig.bearerTokens,
    loadTestConfig.password,
    true
  );

  // Create playlists for each user so they have data to fetch
  const tokenPool = authData.tokenPool;

  console.log("Creating test playlists for each user...");
  for (let i = 0; i < Math.min(loadTestConfig.vus, tokenPool.length); i++) {
    const vuId = i + 1;
    // Create 1-2 playlists per user for variety
    const numPlaylists = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < numPlaylists; j++) {
      const playlistResponse = createPlaylist(vuId, tokenPool);
      if (playlistResponse.status !== 201) {
        console.warn(
          `Failed to create playlist ${j + 1} for VU ${vuId}: Status ${
            playlistResponse.status
          }`
        );
      }
      sleep(0.1);
    }
  }

  console.log("Playlists created for users");
  return { tokenPool: tokenPool };
}

export default function (data) {
  const vuId = __VU;
  const tokenPool = data.tokenPool;
  const playlistsResponse = fetchUserPlaylists(vuId, tokenPool);
  expect.soft(playlistsResponse.status).toBe(200);
  sleep(loadTestConfig.requestDelay);
}
