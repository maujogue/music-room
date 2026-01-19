import {
  checkIfAuthUserAlreadyExist,
  createAuthUser,
  fetchSpotifyUserProfile,
  fetchSpotifyUserToken,
  handleSpotifyAuth,
  handleSpotifyCallback,
  upsertUser,
} from "./index.ts";
import { SupabaseError } from "./supabase_error.ts";
import {
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std@0.203.0/testing/asserts.ts";

Deno.test("handleSpotifyAuth inserts state and redirects", async () => {
  // Mock request/response
  const req = new Request("http://localhost/spotify");
  const res = new Response();
  // Should return a 302 redirect
  const response = await handleSpotifyAuth(req, res);
  assertEquals(response.status, 302);
  assertEquals(
    response.headers.get("Location")?.startsWith(
      "https://accounts.spotify.com/authorize",
    ),
    true,
  );
});

Deno.test("handleSpotifyCallback returns 400 if state is invalid", async () => {
  const req = new Request(
    "http://localhost/spotify/callback?code=abc&state=invalid",
  );
  const res = new Response();
  // Should return 400 for invalid state
  const response = await handleSpotifyCallback(req, res);
  assertEquals(response.status, 400);
});

Deno.test("fetchSpotifyUserToken throws error on bad code", async () => {
  await assertThrowsAsync(
    async () => {
      await fetchSpotifyUserToken("bad_code");
    },
    Error,
    "Error fetching access token",
  );
});

// Add more tests for upsertUser, createAuthUser, checkIfAuthUserAlreadyExist, fetchSpotifyUserProfile as needed
