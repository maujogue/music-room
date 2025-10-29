import http from "k6/http";

const supabaseUrl = __ENV.SUPABASE_URL;
const supabaseKey = __ENV.SUPABASE_KEY;

export function createPlaylist(vuId, tokenPool) {
  const tokenData = tokenPool[(vuId - 1) % tokenPool.length];
  const accessToken = tokenData.accessToken;

  // Generate unique playlist name with timestamp and VU ID
  const timestamp = Date.now();
  const uniqueName = `Load Test Playlist ${vuId}-${timestamp}`;

  const payload = JSON.stringify({
    name: uniqueName,
    description: `Test playlist created during load testing - VU ${vuId} at ${new Date(
      timestamp
    ).toISOString()}`,
    is_private: false,
    is_collaborative: true,
  });

  const response = http.post(`${supabaseUrl}/functions/v1/playlists`, payload, {
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
    },
    tags: { name: "playlist_create" },
  });

  return response;
}
