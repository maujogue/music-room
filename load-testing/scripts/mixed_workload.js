import { sleep } from "k6";
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { setup_bearer_tokens } from "../utils/setup_bearer_tokens.js";
import { loadTestConfig } from "../utils/config.js";

// Import all function modules
import { fetchProfile } from "../functions/fetch_profile.js";
import { updateProfile } from "../functions/update_profile.js";
import { createEvent } from "../functions/create_event.js";
import { fetchEvent } from "../functions/fetch_event.js";
import { fetchUserEvents } from "../functions/fetch_user_events.js";
import { createPlaylist } from "../functions/create_playlist.js";
import { fetchUserPlaylists } from "../functions/fetch_user_playlists.js";

// Get total VUs from environment variable (set by bash script via K6_VUS)
// This is passed from run_k6_test.sh when --vus is used
// Note: When using scenarios, --vus flag is ignored, so we rely on K6_VUS env var
const totalVUs = parseInt(__ENV.K6_VUS || __ENV.VUS || loadTestConfig.vus);

export const options = {
  scenarios: {
    // Profile operations - 45% of traffic (typical: mostly reads)
    profile_read: {
      executor: "constant-vus",
      vus: Math.floor(totalVUs * 0.4),
      duration: loadTestConfig.duration,
      exec: "profileRead",
    },
    profile_update: {
      executor: "constant-vus",
      vus: Math.floor(totalVUs * 0.05),
      duration: loadTestConfig.duration,
      exec: "profileUpdate",
    },

    // Event operations - 40% of traffic
    event_read: {
      executor: "constant-vus",
      vus: Math.floor(totalVUs * 0.3),
      duration: loadTestConfig.duration,
      exec: "eventRead",
      startTime: "2s",
    },
    event_create: {
      executor: "constant-vus",
      vus: Math.floor(totalVUs * 0.05),
      duration: loadTestConfig.duration,
      exec: "eventCreate",
    },
    event_list: {
      executor: "constant-vus",
      vus: Math.floor(totalVUs * 0.05),
      duration: loadTestConfig.duration,
      exec: "eventList",
      startTime: "1s",
    },

    // Playlist operations - 15% of traffic
    // Note: playlist_read excluded - requires Spotify account connection
    playlist_create: {
      executor: "constant-vus",
      vus: Math.floor(totalVUs * 0.05),
      duration: loadTestConfig.duration,
      exec: "playlistCreate",
    },
    playlist_list: {
      executor: "constant-vus",
      vus: Math.floor(totalVUs * 0.1),
      duration: loadTestConfig.duration,
      exec: "playlistList",
      startTime: "1s",
    },
  },
};

// Shared state for created resources
let sharedState = {
  eventIds: [],
  playlistIds: [],
  tokenPool: [],
};

export function setup() {
  const authData = setup_bearer_tokens(
    loadTestConfig.bearerTokens,
    loadTestConfig.password
  );

  // Initialize shared state
  sharedState = {
    eventIds: [],
    playlistIds: [],
    tokenPool: authData.tokenPool,
  };

  // Seed some events and playlists for read operations
  console.log("Seeding test data...");
  for (let i = 0; i < 10; i++) {
    const vuId = i + 1;
    try {
      const eventResponse = createEvent(vuId, authData.tokenPool);
      if (eventResponse.status === 201) {
        sleep(0.2);
        // Try to get the ID via user events list
        const eventsResponse = fetchUserEvents(vuId, authData.tokenPool);
        if (eventsResponse.status === 200) {
          const events = JSON.parse(eventsResponse.body);
          if (events.length > 0 && events[events.length - 1]?.event?.id) {
            sharedState.eventIds.push(events[events.length - 1].event.id);
          }
        }
      }
    } catch (e) {
      // Continue
    }

    try {
      const playlistResponse = createPlaylist(vuId, authData.tokenPool);
      if (playlistResponse.status === 201) {
        try {
          const playlistData = JSON.parse(playlistResponse.body);
          if (playlistData.id) {
            sharedState.playlistIds.push(playlistData.id);
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (e) {
      // Continue
    }
    sleep(0.1);
  }

  console.log(
    `Seeded ${sharedState.eventIds.length} events and ${sharedState.playlistIds.length} playlists`
  );

  return { tokenPool: authData.tokenPool };
}

// Profile operations
export function profileRead(data) {
  const vuId = __VU;
  const tokenPool = data.tokenPool;
  const response = fetchProfile(vuId, tokenPool);
  expect.soft(response.status).toBe(200);
  sleep(loadTestConfig.requestDelay);
}

export function profileUpdate(data) {
  const vuId = __VU;
  const tokenPool = data.tokenPool;
  const response = updateProfile(vuId, tokenPool);
  expect.soft(response.status).toBe(200);
  sleep(loadTestConfig.requestDelay);
}

// Event operations
export function eventCreate(data) {
  const vuId = __VU;
  const tokenPool = data.tokenPool;
  const response = createEvent(vuId, tokenPool);
  expect.soft(response.status).toBe(201);
  sleep(loadTestConfig.requestDelay);
}

export function eventRead(data) {
  const tokenPool = data.tokenPool;
  if (sharedState.eventIds.length === 0) {
    // No events available yet, skip
    sleep(loadTestConfig.requestDelay);
    return;
  }
  const eventId =
    sharedState.eventIds[
      Math.floor(Math.random() * sharedState.eventIds.length)
    ];
  const response = fetchEvent(eventId, tokenPool);
  expect.soft(response.status).toBe(200);
  sleep(loadTestConfig.requestDelay);
}

export function eventList(data) {
  const vuId = __VU;
  const tokenPool = data.tokenPool;
  const response = fetchUserEvents(vuId, tokenPool);
  expect.soft(response.status).toBe(200);
  sleep(loadTestConfig.requestDelay);
}

// Playlist operations
export function playlistCreate(data) {
  const vuId = __VU;
  const tokenPool = data.tokenPool;
  const response = createPlaylist(vuId, tokenPool);
  if (response.status === 201) {
    try {
      const playlistData = JSON.parse(response.body);
      if (playlistData.id) {
        // Thread-safe push to shared state
        sharedState.playlistIds.push(playlistData.id);
      }
    } catch (e) {
      // Ignore
    }
  }
  expect.soft(response.status).toBe(201);
  sleep(loadTestConfig.requestDelay);
}

export function playlistList(data) {
  const vuId = __VU;
  const tokenPool = data.tokenPool;
  const response = fetchUserPlaylists(vuId, tokenPool);
  expect.soft(response.status).toBe(200);
  sleep(loadTestConfig.requestDelay);
}
