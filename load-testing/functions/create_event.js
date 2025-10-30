import http from "k6/http";

const supabaseUrl = __ENV.SUPABASE_URL;
const supabaseKey = __ENV.SUPABASE_KEY;

export function createEvent(vuId, tokenPool) {
  const tokenData = tokenPool[(vuId - 1) % tokenPool.length];
  const accessToken = tokenData.accessToken;

  // Create a future date for the event
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
  const isoDate = futureDate.toISOString();

  // Generate unique event name with timestamp, VU ID, and random component
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9); // Random alphanumeric
  const uniqueName = `Load Test Event ${vuId}-${timestamp}-${randomSuffix}`;

  const payload = JSON.stringify({
    name: uniqueName,
    description: `Test event created during load testing - VU ${vuId} at ${new Date(
      timestamp
    ).toISOString()}`,
    beginning_at: isoDate,
    is_private: false,
    everyone_can_vote: true,
  });

  const response = http.post(`${supabaseUrl}/functions/v1/events`, payload, {
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
    },
    tags: { name: "event_create" },
  });

  return response;
}
