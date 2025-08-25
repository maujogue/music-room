// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const base_url = "https://404a13eda7fd.ngrok-free.app"

function getCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
}


function generateRandomString(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

Deno.serve(async (req, res) => {
  const url = req.url

  console.log("Request URL:", url);

  if (url.includes("/spotify/callback")) {
    return handleSpotifyCallback(req, res)
  }
  if (url.includes("/spotify")) {
    return handleSpotifyAuth(req, res)
  }

  return new Response(
    "blc",
    { headers: { "Content-Type": "application/json" } },
  )
})

function handleSpotifyAuth(req: Request, res: Response): Response {
  var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: "f34c3840efdf4098b299c94c63708f04",
    scope: scope,
    redirect_uri: `${base_url}/functions/v1/auth/spotify/callback`,
    state: state
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: 'https://accounts.spotify.com/authorize?' + params.toString(),
      "Set-Cookie": `spotify_state=${state}; HttpOnly; Path=/; Secure;`
    },
  });
}

function handleSpotifyCallback(req: Request, res: Response): Response {
  console.log("Handling Spotify callback");
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieHeader = req.headers.get("cookie");
  const spotifyState = getCookieValue(cookieHeader, "spotify_state");


  console.log("Authorization code:", code);
  console.log("State:", state);

  const bodyParams = new URLSearchParams();
  bodyParams.append("code", code ?? "");
  bodyParams.append("redirect_uri", redirect_uri);
  bodyParams.append("grant_type", "authorization_code");

  const authHeader = "Basic " + btoa(client_id + ":" + client_secret);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": authHeader,
    },
    body: bodyParams.toString(),
  });
  }

  // return new Response(
  //   JSON.stringify({ message: "Spotify callback handled" }),
  //   { headers: { "Content-Type": "application/json" } },
  // );
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/auth' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
