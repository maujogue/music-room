import { sleep } from "k6";
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { setup_bearer_tokens } from "../utils/setup_bearer_tokens.js";
import { createPlaylist } from "../functions/create_playlist.js";
import { fetchPlaylist } from "../functions/fetch_playlist.js";
import { loadTestConfig } from "../utils/config.js";

export const options = {
  vus: loadTestConfig.vus,
  duration: loadTestConfig.duration,
};

export function setup() {
  const authData = setup_bearer_tokens(
    loadTestConfig.bearerTokens,
    loadTestConfig.password
  );

  // Create test playlists in setup phase for VUs to read
  const playlistIds = [];
  const tokenPool = authData.tokenPool;

  console.log("Creating test playlists for read testing...");
  for (let i = 0; i < Math.min(loadTestConfig.vus, tokenPool.length); i++) {
    const vuId = i + 1;
    const playlistResponse = createPlaylist(vuId, tokenPool);
    if (playlistResponse.status === 201) {
      try {
        const playlistData = JSON.parse(playlistResponse.body);
        if (playlistData.id) {
          playlistIds.push(playlistData.id);
        }
      } catch (e) {
        console.warn(`Failed to parse playlist response for VU ${vuId}`);
      }
    } else {
      console.warn(
        `Failed to create playlist for VU ${vuId}: Status ${playlistResponse.status}`
      );
    }
    sleep(0.1); // Small delay between creations
  }

  console.log(`Created ${playlistIds.length} test playlists`);
  return { tokenPool: tokenPool, playlistIds: playlistIds };
}

export default function (data) {
  const tokenPool = data.tokenPool;
  const playlistIds = data.playlistIds;

  if (!playlistIds || playlistIds.length === 0) {
    console.error("No playlist IDs available for testing");
    return;
  }

  // Randomly select a playlist to read
  const randomPlaylistId =
    playlistIds[Math.floor(Math.random() * playlistIds.length)];
  const playlistResponse = fetchPlaylist(randomPlaylistId, tokenPool);
  expect.soft(playlistResponse.status).toBe(200);
  sleep(loadTestConfig.requestDelay);
}
