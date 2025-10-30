import { sleep } from "k6";
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { setup_bearer_tokens } from "../utils/setup_bearer_tokens.js";
import { createEvent } from "../functions/create_event.js";
import { fetchUserEvents } from "../functions/fetch_user_events.js";
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

  // Create events for each user so they have data to fetch
  const tokenPool = authData.tokenPool;

  console.log("Creating test events for each user...");
  for (let i = 0; i < Math.min(loadTestConfig.vus, tokenPool.length); i++) {
    const vuId = i + 1;
    // Create 1-2 events per user for variety
    const numEvents = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < numEvents; j++) {
      let eventResponse = createEvent(vuId, tokenPool);

      // Retry if duplicate name conflict (409)
      if (eventResponse.status === 409) {
        console.warn(`Duplicate event name for VU ${vuId}, retrying...`);
        sleep(0.1);
        eventResponse = createEvent(vuId, tokenPool); // Retry with new timestamp
      }

      if (eventResponse.status !== 201) {
        console.warn(
          `Failed to create event ${j + 1} for VU ${vuId}: Status ${
            eventResponse.status
          }`
        );
      }
      sleep(0.1);
    }
  }

  console.log("Events created for users");
  return { tokenPool: tokenPool };
}

export default function (data) {
  const vuId = __VU;
  const tokenPool = data.tokenPool;
  const eventsResponse = fetchUserEvents(vuId, tokenPool);
  expect.soft(eventsResponse.status).toBe(200);
  sleep(loadTestConfig.requestDelay);
}
