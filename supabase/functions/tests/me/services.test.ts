import {
  getUserPlayingTrack,
  getCurrentUserPlaylists,
  pausePlayback,
  skipToNextTrack,
} from "../../me/services/spotify.ts";

const VALID_TOKEN = "valid_token";

async function withMockedFetch(
  mockFetch: (
    _url: string | URL | Request,
    _options?: RequestInit,
  ) => Promise<Response>,
  fn: () => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    await fn();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

Deno.test("getCurrentUserPlaylists returns playlists", async () => {
  await withMockedFetch(
    (_url, _options) => {
      const mockProfile = {
        items: [
          { id: "playlist-1", name: "Focus Beats" },
          { id: "playlist-2", name: "Late Night Code" },
        ],
      };
      return Promise.resolve(
        new Response(JSON.stringify(mockProfile), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    },
    async () => {
      const result = await getCurrentUserPlaylists(VALID_TOKEN);
      if (result.error) {
        throw new Error(result.error.message);
      }
      if (!result.items || !Array.isArray(result.items)) {
        throw new Error("Result does not contain a playlists array in items");
      }
      if (result.items.length === 0) {
        throw new Error("No playlists returned for this user");
      }

      for (const playlist of result.items) {
        if (!playlist.id || !playlist.name) {
          throw new Error("A playlist is invalid: missing id or name");
        }
      }
    },
  );
});

Deno.test("getCurrentUserPlaylists returns invalid acces token error", async () => {
  await withMockedFetch(
    (_url, _options) => {
      const errorResponse = {
        error: { status: 401, message: "Invalid access token" },
      };
      return Promise.resolve(
        new Response(JSON.stringify(errorResponse), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      );
    },
    async () => {
      const result = await getCurrentUserPlaylists("invalid_token");

      if (!result.error) {
        throw new Error(
          "An error code should be return by getCurrentUserPlaylists",
        );
      }
    },
  );
});

Deno.test("getUserPlayingTrack returns invalid acces token error", async () => {
  await withMockedFetch(
    (_url, _options) => {
      const errorResponse = {
        error: { status: 401, message: "Invalid access token" },
      };
      return Promise.resolve(
        new Response(JSON.stringify(errorResponse), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      );
    },
    async () => {
      const result = await getUserPlayingTrack("invalid_token");

      if (!result.error) {
        throw new Error(
          "An error code should be return by getUserPlayingTrack",
        );
      }
    },
  );
});

Deno.test("getUserPlayingTrack returns valid response", async () => {
  await withMockedFetch(
    (_url, _options) => {
      const mockTrack = {
        is_playing: true,
        item: { id: "track-1", name: "Lofi Dreams" },
      };
      return Promise.resolve(
        new Response(JSON.stringify(mockTrack), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    },
    async () => {
      const result = await getUserPlayingTrack(VALID_TOKEN);

      if (result.error) {
        throw new Error(
          "An error code should not be return by getUserPlayingTrack",
        );
      }
    },
  );
});

Deno.test("pausePlayback returns valid response", async () => {
  await withMockedFetch(
    (_url, _options) =>
      Promise.resolve(
        new Response(null, {
          status: 204,
          statusText: "No Content",
        }),
      ),
    async () => {
      const result = await pausePlayback(VALID_TOKEN);
      await result.text();

      if (result.error) {
        throw new Error("An error code should not be return by pausePlayback");
      }
    },
  );
});

Deno.test("skipToNextTrack returns valid response", async () => {
  await withMockedFetch(
    (_url, _options) =>
      Promise.resolve(
        new Response(null, {
          status: 204,
          statusText: "No Content",
        }),
      ),
    async () => {
      const result = await skipToNextTrack(VALID_TOKEN);
      await result.text();

      if (result.error) {
        throw new Error(
          "An error code should not be return by skipToNextTrack",
        );
      }
    },
  );
});

Deno.test("pausePlayback returns invalid acces token error", async () => {
  await withMockedFetch(
    (_url, _options) =>
      Promise.resolve(
        new Response("", {
          status: 401,
          statusText: "Unauthorized",
        }),
      ),
    async () => {
      const result = await pausePlayback("invalid_token");
      await result.text();

      if (result["status"] !== 401 && result["statusText"] !== "Unauthorized") {
        throw new Error("This test expects a 401 status code");
      }
    },
  );
});

Deno.test("skipToNextTrack returns invalid acces token error", async () => {
  await withMockedFetch(
    (_url, _options) =>
      Promise.resolve(
        new Response("", {
          status: 401,
          statusText: "Unauthorized",
        }),
      ),
    async () => {
      const result = await skipToNextTrack("invalid_token");
      await result.text();

      if (result["status"] !== 401 && result["statusText"] !== "Unauthorized") {
        throw new Error("This test expects a 401 status code");
      }
    },
  );
});
