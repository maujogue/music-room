import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { formatDbError } from "../../../utils/postgres_errors_map.ts";
import { HTTPException } from "https://deno.land/x/hono@v3.2.3/http-exception.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

export async function insertOauthStateToSupabase(
  state: string,
  user_id: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("oauth_state")
    .insert([{ state, user_id }]);
  if (error) {
    console.error("Supabase error:", error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
}

export async function getAndDeleteOauthState(
  state: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("oauth_state")
      .select("*")
      .eq("state", state)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      const pgError = formatDbError(error);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }

    if (!data) {
      throw new HTTPException(400, { message: "Invalid state parameter" });
    }

    const { error: deleteError } = await supabase
      .from("oauth_state")
      .delete()
      .eq("state", state);

    if (deleteError) {
      console.error("Supabase error:", deleteError);
      const pgError = formatDbError(deleteError);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }

    return data.user_id;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(400, {
      message: "Error occurred while fetching OAuth state",
    });
  }
}

export async function updateSpotifyUserTokens(
  user_id: string,
  spotify_token_data: any,
): Promise<void> {
  await supabase.from("profiles").upsert({
    id: user_id,
    spotify_access_token: spotify_token_data.access_token,
    spotify_refresh_token: spotify_token_data.refresh_token,
    spotify_token_expires_at: spotify_token_data.expires_in
      ? new Date(Date.now() + spotify_token_data.expires_in * 1000)
      : null,
  });
}

export async function createUserWithSpotifyData(userData: any): Promise<any> {
  const spotifyUser = {
    id: userData.id,
    email: userData.email,
    displayName: userData.displayName,
  };

  // Extract username from email (part before @)
  // If email doesn't have @ or username is too short, fallback to displayName or generate one
  let username = spotifyUser.email?.split("@")[0] || spotifyUser.displayName ||
    "user";

  // Ensure username meets minimum length requirement (3 characters)
  // If too short, pad with numbers or use displayName
  if (username.length < 3) {
    username = spotifyUser.displayName || username + "123";
  }

  // Ensure username doesn't exceed reasonable length (20 chars)
  if (username.length > 20) {
    username = username.substring(0, 20);
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: spotifyUser.email,
    email_confirm: true,
    password: crypto.randomUUID(),
    user_metadata: {
      username: username,
      display_name: spotifyUser.displayName,
    },
  });

  if (error) {
    console.error("Supabase error:", error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
  return data;
}

export async function findUserByEmail(email: string): Promise<any | null> {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Supabase error:", error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  const user = data.users.find((user) => user.email === email);
  return user || null;
}

export async function impersonateUser(userEmail: string) {
  // Generate magic link to get session tokens
  const { data: magicLink, error: linkError } = await supabase.auth.admin
    .generateLink({
      type: "magiclink",
      email: userEmail,
    });

  if (linkError || !magicLink?.properties?.hashed_token) {
    throw new Error("Failed to generate auth token");
  }

  let verified;
  try {
    const result = await supabase.auth.verifyOtp({
      token_hash: magicLink.properties.hashed_token,
      type: "email",
    });
    verified = result.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw new Error("Failed to verify OTP");
  }

  if (!verified || !verified.session) {
    throw new Error("OTP verification did not return a valid session");
  }

  const accessToken = verified.session.access_token;
  const refreshToken = verified.session.refresh_token;

  if (!accessToken || !refreshToken) {
    throw new Error("Failed to extract session tokens");
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}
