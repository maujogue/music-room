import { createClient, User } from "@supabase/supabase-js";
import { HTTPException } from "@hono/http-exception";
import { formatDbError } from "@postgres/postgres_errors_map";
import type { HonoRequest } from "@hono/hono";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

export function generateRandomString(length: number): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export async function getCurrentUser(req: HonoRequest): Promise<User> {
  const authHeader = req.header("Authorization") || req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, {
      message: "Unauthorized: No token provided",
    });
  }

  const token = authHeader.substring(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data) {
    const errorResponse = new Response("Failed to fetch user data", {
      status: 401,
    });
    throw new HTTPException(401, { res: errorResponse });
  }

  return data.user;
}

export async function getCurrentUserOptional(
  req: HonoRequest
): Promise<User | null> {
  const authHeader = req.header("Authorization") || req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data) {
    return null;
  }

  return data.user;
}

export async function getUserSpotifyToken(
  user_id: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("spotify_access_token,spotify_refresh_token")
    .eq("id", user_id);

  if (error || !data) {
    const errorResponse = new Response("Failed to fetch user data", {
      status: 500,
    });
    throw new HTTPException(500, { res: errorResponse });
  }

  return data[0].spotify_access_token;
}

export async function refreshSpotifyToken(user_id: string): Promise<void> {
  const { data, error } = await supabase
    .from("profiles")
    .select("spotify_refresh_token")
    .eq("id", user_id);

  if (error) {
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new HTTPException(400, {
      message: "No user profile found for refresh token",
    });
  }
  const refresh_token = data[0].spotify_refresh_token;
  if (!refresh_token) {
    throw new HTTPException(401, { message: "No refresh token available" });
  }

  const client_id = Deno.env.get("SPOTIFY_CLIENT_ID")!;
  const client_secret = Deno.env.get("SPOTIFY_CLIENT_SECRET")!;
  const authHeader = "Basic " + btoa(client_id + ":" + client_secret);

  const bodyParams = new URLSearchParams();
  bodyParams.append("grant_type", "refresh_token");
  bodyParams.append("refresh_token", refresh_token);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authHeader,
    },
    body: bodyParams.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HTTPException(500, {
      message: "Error refreshing access token: " + errorText,
    });
  }

  const tokenData = await response.json();

  const upsertData = {
    spotify_access_token: tokenData.access_token,
    spotify_token_expires_at: tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null,
  };

  const { error: upsertError } = await supabase
    .from("profiles")
    .update(upsertData)
    .eq("id", user_id);

  if (upsertError) {
    const pgError = formatDbError(upsertError);
    throw new HTTPException(pgError.status || 500, {
      message: pgError.message || "Failed to update Spotify token",
    });
  }
}
