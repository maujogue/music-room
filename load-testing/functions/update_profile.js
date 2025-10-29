import http from "k6/http";

const supabaseUrl = __ENV.SUPABASE_URL;
const supabaseKey = __ENV.SUPABASE_KEY;

export function updateProfile(vuId, tokenPool) {
  const tokenData = tokenPool[(vuId - 1) % tokenPool.length];
  const accessToken = tokenData.accessToken;

  const payload = JSON.stringify({
    bio: `Updated bio for load test - VU ${vuId} at ${new Date().toISOString()}`,
    music_genre: ["Pop", "Rock", "Electronic"],
  });

  const response = http.put(
    `${supabaseUrl}/functions/v1/profile/update`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${accessToken}`,
      },
      tags: { name: "profile_update" },
    }
  );

  return response;
}
