import { Context } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import { generateRandomString } from "./utils.ts";
import {
  createUserWithSpotifyData,
  findUserByEmail,
  getAndDeleteOauthState,
  impersonateUser,
  insertOauthStateToSupabase,
  updateSpotifyUserTokens,
} from "./services/supabase.ts";
import {
  fetchSpotifyUserProfile,
  fetchSpotifyUserTokenData,
} from "./services/spotify.ts";

const client_id = Deno.env.get("SPOTIFY_CLIENT_ID")!;
const base_url = Deno.env.get("SUPABASE_URL")!;
const spotify_redirect_uri = Deno.env.get("SPOTIFY_REDIRECT_URI")! || base_url;
const redirect_uri =
  `${spotify_redirect_uri}/functions/v1/auth/spotify/callback`;

export async function handleSpotifyAuth(c: Context) {
  const state = generateRandomString(16);
  const scope = [
    "user-read-private",
    "user-read-email",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "playlist-modify-public",
    "playlist-read-private",
    "playlist-modify-private",
  ].join(" ");
  const user = c.get("user") || null;

  await insertOauthStateToSupabase(state, user?.id || null);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });

  const spotifyAuthUrl = "https://accounts.spotify.com/authorize?" +
    params.toString();

  c.status(200);
  return c.json({ url: spotifyAuthUrl });
}

export async function handleSpotifyCallback(c: Context) {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const spotifyError = c.req.query("error");

  if (spotifyError) {
    if (spotifyError === "access_denied") {
      c.status(403);
      return c.json({ message: "Access denied by user" });
    }
    console.error("Spotify error:", spotifyError);
    c.status(500);
    return c.json({ message: "Spotify error: " + spotifyError });
  }

  const user_id = await getAndDeleteOauthState(state);

  if (!code) {
    c.status(400);
    return c.json({ message: "Missing code" });
  }

  const token = await fetchSpotifyUserTokenData(code);
  if (!token || !token.access_token) {
    c.status(500);
    return c.json({ message: "Failed to obtain access token from Spotify" });
  }

  // Get Spotify user profile
  const spotifyProfile = await fetchSpotifyUserProfile(token.access_token);

  if (user_id) {
    // Existing user - just update their Spotify tokens
    await updateSpotifyUserTokens(user_id, token);

    // Redirect back to the app without logging in (user is already logged in)
    const redirectUrl = `music-room://(main)/profile`;
    return c.redirect(redirectUrl);
  } else {
    // No existing user - this is a login flow
    // Check if user exists by email
    const existingUser = await findUserByEmail(spotifyProfile.email);

    if (existingUser) {
      // User exists - update their Spotify tokens
      await updateSpotifyUserTokens(existingUser.id, token);
    } else {
      // New user - create account with Spotify data
      const newUser = await createUserWithSpotifyData({
        id: spotifyProfile.id,
        email: spotifyProfile.email,
        displayName: spotifyProfile.display_name,
      });
      // Update the new user's Spotify tokens
      await updateSpotifyUserTokens(newUser.user.id, token);
    }

    // Log the user in and redirect to callback
    const sessionTokens = await impersonateUser(spotifyProfile.email);
    const redirectUrl =
      `music-room://(auth)/callback?access_token=${sessionTokens.access_token}&refresh_token=${sessionTokens.refresh_token}`;
    return c.redirect(redirectUrl);
  }
}
