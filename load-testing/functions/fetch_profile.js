import http from "k6/http";

const supabaseUrl = __ENV.SUPABASE_URL;
const supabaseKey = __ENV.SUPABASE_KEY;

export function fetchProfile(vuId, tokenPool) {
  const tokenData = tokenPool[(vuId - 1) % tokenPool.length];
  const userId = tokenData.userId;
  const accessToken = tokenData.accessToken;

  const profileResponse = http.get(
    `${supabaseUrl}/functions/v1/profile/user/${userId}`,
    {
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${accessToken}`,
      },
      tags: { name: "profile_fetch" },
    }
  );
  return profileResponse;
}
