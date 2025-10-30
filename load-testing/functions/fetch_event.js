import http from "k6/http";

const supabaseUrl = __ENV.SUPABASE_URL;
const supabaseKey = __ENV.SUPABASE_KEY;

export function fetchEvent(eventId, tokenPool) {
  const tokenData = tokenPool[Math.floor(Math.random() * tokenPool.length)];
  const accessToken = tokenData.accessToken;

  const response = http.get(`${supabaseUrl}/functions/v1/events/${eventId}`, {
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
    },
    tags: { name: "event_fetch" },
  });

  return response;
}
