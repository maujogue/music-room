import http from "k6/http";

const supabaseUrl = __ENV.SUPABASE_URL;
const supabaseKey = __ENV.SUPABASE_KEY;

export function fetchUserPlaylists(vuId, tokenPool) {
  const tokenData = tokenPool[(vuId - 1) % tokenPool.length];
  const accessToken = tokenData.accessToken;

  const response = http.get(`${supabaseUrl}/functions/v1/me/playlists`, {
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
    },
    tags: { name: "me_playlists_fetch" },
  });

  return response;
}
