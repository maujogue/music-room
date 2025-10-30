import { sleep } from "k6";
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { setup_bearer_tokens } from "../utils/setup_bearer_tokens.js";
import { createPlaylist } from "../functions/create_playlist.js";
import { loadTestConfig } from "../utils/config.js";

export const options = {
  vus: loadTestConfig.vus,
  duration: loadTestConfig.duration,
};

export function setup() {
  return setup_bearer_tokens(
    loadTestConfig.bearerTokens,
    loadTestConfig.password
  );
}

export default function (data) {
  const vuId = __VU;
  const tokenPool = data.tokenPool;
  const playlistResponse = createPlaylist(vuId, tokenPool);
  expect.soft(playlistResponse.status).toBe(201);
  sleep(loadTestConfig.requestDelay);
}
