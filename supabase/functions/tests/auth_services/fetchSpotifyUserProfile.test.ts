import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { fetchSpotifyUserProfile } from "../../../functions/auth/services/spotify.ts";

Deno.test("fetchSpotifyUserProfile should throw an error for invalid access token", async () => {
  const mockAccessToken = "D6lEX6Oj83iMIcOSBLgIbPdf6F6t7aBw";

  const originalFetch = globalThis.fetch;

  globalThis.fetch = (
    _url: string | URL | Request,
    _options: any,
  ): Promise<Response> => {
    const errorResponse = {
      error: { status: 401, message: "Invalid access token" },
    };
    return Promise.resolve(
      new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
  };

  await assertRejects(
    async () => {
      await fetchSpotifyUserProfile(mockAccessToken);
    },
    Error,
    'Error fetching user profile: {"error":{"status":401,"message":"Invalid access token"}}',
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
  globalThis.fetch = (
    _url: string | URL | Request,
    _options: any,
  ): Promise<Response> =>
    Promise.resolve(
      new Response(JSON.stringify(mockProfile), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

  const response = await fetchSpotifyUserProfile(mockAccessToken);
  assertEquals(response, mockProfile);

  globalThis.fetch = originalFetch;
});
