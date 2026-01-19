import http from "k6/http";

const supabaseUrl = __ENV.SUPABASE_URL;
const supabaseKey = __ENV.SUPABASE_KEY;

export function fetchUserEvents(vuId, tokenPool) {
  const tokenData = tokenPool[(vuId - 1) % tokenPool.length];
  const accessToken = tokenData.accessToken;

  const response = http.get(`${supabaseUrl}/functions/v1/me/events`, {
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
    },
    tags: { name: "me_events_fetch" },
  });

  return response;
}
