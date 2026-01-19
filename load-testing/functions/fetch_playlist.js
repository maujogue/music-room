import http from "k6/http";

const supabaseUrl = __ENV.SUPABASE_URL;
const supabaseKey = __ENV.SUPABASE_KEY;

export function fetchPlaylist(playlistId, tokenPool) {
  const tokenData = tokenPool[Math.floor(Math.random() * tokenPool.length)];
  const accessToken = tokenData.accessToken;

  const response = http.get(
    `${supabaseUrl}/functions/v1/playlists/${playlistId}`,
    {
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${accessToken}`,
      },
      tags: { name: "playlist_fetch" },
    }
  );

  return response;
}
