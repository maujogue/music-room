import { sleep } from "k6";
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { setup_bearer_tokens } from "../utils/setup_bearer_tokens.js";
import { createEvent } from "../functions/create_event.js";
import { fetchEvent } from "../functions/fetch_event.js";
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

  // Create test events in setup phase for VUs to read
  const eventIds = [];
  const tokenPool = authData.tokenPool;

  console.log("Creating test events for read testing...");
  for (let i = 0; i < Math.min(loadTestConfig.vus, tokenPool.length); i++) {
    const vuId = i + 1;
    const tokenData = tokenPool[(vuId - 1) % tokenPool.length];

    // Get events count before creation to identify new event
    let eventsBefore = [];
    try {
      const beforeResponse = fetchUserEvents(vuId, tokenPool);
      if (beforeResponse.status === 200) {
        eventsBefore = JSON.parse(beforeResponse.body);
      }
    } catch (e) {
      // Ignore - might be first event
    }

    let eventResponse = createEvent(vuId, tokenPool);

    // Retry if duplicate name conflict (409)
    if (eventResponse.status === 409) {
      console.warn(`Duplicate event name for VU ${vuId}, retrying...`);
      sleep(0.2);
      eventResponse = createEvent(vuId, tokenPool); // Retry with new timestamp
    }

    if (eventResponse.status === 201) {
      // Wait a bit for DB to sync
      sleep(0.2);

      // Fetch user's events to get the newly created event ID
      try {
        const afterResponse = fetchUserEvents(vuId, tokenPool);
        if (afterResponse.status === 200) {
          const eventsAfter = JSON.parse(afterResponse.body);
          // Find the new event by comparing with eventsBefore
          const beforeIds = new Set(
            eventsBefore.map((e) => e?.event?.id).filter(Boolean)
          );

          // Find any event that wasn't in the before list
          for (const eventData of eventsAfter) {
            if (eventData?.event?.id && !beforeIds.has(eventData.event.id)) {
              eventIds.push(eventData.event.id);
              break; // Found the new event
            }
          }

          // If we couldn't find it by comparison, try getting the most recent
          if (
            eventsAfter.length > eventsBefore.length &&
            eventIds.length === 0
          ) {
            const lastEvent = eventsAfter[eventsAfter.length - 1];
            if (lastEvent?.event?.id) {
              eventIds.push(lastEvent.event.id);
            }
          }
        }
      } catch (e) {
        console.warn(
          `Failed to fetch created event ID for VU ${vuId}:`,
          e.message
        );
      }
    } else {
      console.warn(
        `Failed to create event for VU ${vuId}: Status ${eventResponse.status}`
      );
    }
    sleep(0.1); // Small delay between creations
  }

  console.log(`Created ${eventIds.length} test events`);
  return { tokenPool: tokenPool, eventIds: eventIds };
}

export default function (data) {
  const tokenPool = data.tokenPool;
  const eventIds = data.eventIds;

  if (!eventIds || eventIds.length === 0) {
    console.error("No event IDs available for testing");
    return;
  }

  // Randomly select an event to read
  const randomEventId = eventIds[Math.floor(Math.random() * eventIds.length)];
  const eventResponse = fetchEvent(randomEventId, tokenPool);
  expect.soft(eventResponse.status).toBe(200);
  sleep(loadTestConfig.requestDelay);
}
