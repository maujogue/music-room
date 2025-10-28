import { assertRejects, assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { fetchSpotifyUserProfile } from "../../../functions/auth/services/spotify.ts";


Deno.test("fetchSpotifyUserProfile should throw an error for invalid access token", async () => {
  const mockAccessToken = "D6lEX6Oj83iMIcOSBLgIbPdf6F6t7aBw";

  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (_url: string, _options: any) => {
    const errorResponse = {
      error: { status: 401, message: "Invalid access token" },
    };
    return {
      ok: false,
      status: 401,
      json: async () => errorResponse,
      text: async () => JSON.stringify(errorResponse),
    } as Response;
  };

  await assertRejects(
    async () => {
      await fetchSpotifyUserProfile(mockAccessToken);
    },
    Error,
    'Error fetching user profile: {"error":{"status":401,"message":"Invalid access token"}}'
  );

  globalThis.fetch = originalFetch;
});


Deno.test("fetchSpotifyUserProfile should return user profile for valid token", async () => {
  const mockAccessToken = "FAKE_VALID_TOKEN";

  const originalFetch = globalThis.fetch;

  const mockProfile = {
    display_name: "Test User",
    id: "testuser123",
    email: "testuser@example.com",
  };
  globalThis.fetch = async (_url: string, _options: any) => {
    return {
      ok: true,
      status: 200,
      json: async () => mockProfile,
    } as Response;
  };

  const response = await fetchSpotifyUserProfile(mockAccessToken);
  assertEquals(response, mockProfile);

  globalThis.fetch = originalFetch;
});
