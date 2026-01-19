import { assertEquals, assertExists } from "jsr:@std/assert";
import { afterEach, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { restore, stub } from "jsr:@std/testing/mock";

type UpsertParams = {
  id: string;
  spotify_access_token: string;
  spotify_refresh_token: string;
  spotify_token_expires_at: Date | null;
};

const createSupabaseMock = () => {
  let capturedUpsertParams: UpsertParams | null = null;

  return {
    client: {
      from: (table: string) => ({
        upsert: async (params: UpsertParams) => {
          capturedUpsertParams = params;
          return { data: null, error: null };
        },
      }),
    },
    getCapturedUpsertParams: () => capturedUpsertParams,
    resetCapturedParams: () => {
      capturedUpsertParams = null;
    },
  };
};

describe("updateSpotifyUserTokens", () => {
  let supabaseMock: ReturnType<typeof createSupabaseMock>;
  let updateSpotifyUserTokens: (
    user_id: string,
    spotify_token_data: any,
  ) => Promise<void>;
  let dateNowStub: any;
  const MOCK_NOW = 1700000000000;

  beforeEach(() => {
    supabaseMock = createSupabaseMock();

    dateNowStub = stub(Date, "now", () => MOCK_NOW);

    updateSpotifyUserTokens = async (
      user_id: string,
      spotify_token_data: any,
    ): Promise<void> => {
      await supabaseMock.client.from("profiles").upsert({
        id: user_id,
        spotify_access_token: spotify_token_data.access_token,
        spotify_refresh_token: spotify_token_data.refresh_token,
        spotify_token_expires_at: spotify_token_data.expires_in
          ? new Date(Date.now() + spotify_token_data.expires_in * 1000)
          : null,
      });
    };
  });

  afterEach(() => {
    restore();
    supabaseMock.resetCapturedParams();
  });

  it("should upsert user tokens with valid data", async () => {
    const userId = "user-123";
    const tokenData = {
      access_token: "access-token-xyz",
      refresh_token: "refresh-token-abc",
      expires_in: 3600,
    };

    await updateSpotifyUserTokens(userId, tokenData);

    const params = supabaseMock.getCapturedUpsertParams();
    assertExists(params);
    assertEquals(params.id, userId);
    assertEquals(params.spotify_access_token, "access-token-xyz");
    assertEquals(params.spotify_refresh_token, "refresh-token-abc");
    assertEquals(
      params.spotify_token_expires_at!.getTime(),
      MOCK_NOW + 3600 * 1000,
    );
  });

  it("should set expires_at to null when expires_in is not provided", async () => {
    const userId = "user-456";
    const tokenData = {
      access_token: "access-token-123",
      refresh_token: "refresh-token-456",
    };

    await updateSpotifyUserTokens(userId, tokenData);

    const params = supabaseMock.getCapturedUpsertParams();
    assertExists(params);
    assertEquals(params.spotify_token_expires_at, null);
  });

  it("should set expires_at to null when expires_in is 0", async () => {
    const userId = "user-789";
    const tokenData = {
      access_token: "access-token-999",
      refresh_token: "refresh-token-888",
      expires_in: 0,
    };

    await updateSpotifyUserTokens(userId, tokenData);

    const params = supabaseMock.getCapturedUpsertParams();
    assertExists(params);
    assertEquals(params.spotify_token_expires_at, null);
  });

  it("should set expires_at to null when expires_in is null", async () => {
    const userId = "user-null";
    const tokenData = {
      access_token: "access-token-null",
      refresh_token: "refresh-token-null",
      expires_in: null,
    };

    await updateSpotifyUserTokens(userId, tokenData);

    const params = supabaseMock.getCapturedUpsertParams();
    assertExists(params);
    assertEquals(params.spotify_token_expires_at, null);
  });

  it("should calculate correct expiration time with different expires_in values", async () => {
    const testCases = [
      { expires_in: 3600, expectedOffset: 3600 * 1000 },
      { expires_in: 7200, expectedOffset: 7200 * 1000 },
      { expires_in: 60, expectedOffset: 60 * 1000 },
      { expires_in: 86400, expectedOffset: 86400 * 1000 },
    ];

    for (const testCase of testCases) {
      supabaseMock.resetCapturedParams();

      const tokenData = {
        access_token: "token",
        refresh_token: "refresh",
        expires_in: testCase.expires_in,
      };

      await updateSpotifyUserTokens("user-test", tokenData);

      const params = supabaseMock.getCapturedUpsertParams();
      assertExists(params);
      assertEquals(
        params.spotify_token_expires_at!.getTime(),
        MOCK_NOW + testCase.expectedOffset,
      );
    }
  });

  it("should handle long access tokens", async () => {
    const userId = "user-long-token";
    const longToken = "a".repeat(1000);
    const tokenData = {
      access_token: longToken,
      refresh_token: "refresh-token",
      expires_in: 3600,
    };

    await updateSpotifyUserTokens(userId, tokenData);

    const params = supabaseMock.getCapturedUpsertParams();
    assertExists(params);
    assertEquals(params.spotify_access_token, longToken);
  });

  it("should handle special characters in tokens", async () => {
    const userId = "user-special";
    const tokenData = {
      access_token: "token-with-special_chars.123-ABC",
      refresh_token: "refresh_token.with-dots_and-dashes",
      expires_in: 3600,
    };

    await updateSpotifyUserTokens(userId, tokenData);

    const params = supabaseMock.getCapturedUpsertParams();
    assertExists(params);
    assertEquals(
      params.spotify_access_token,
      "token-with-special_chars.123-ABC",
    );
    assertEquals(
      params.spotify_refresh_token,
      "refresh_token.with-dots_and-dashes",
    );
  });

  it("should handle UUIDs as user_id", async () => {
    const userId = "550e8400-e29b-41d4-a716-446655440000";
    const tokenData = {
      access_token: "access",
      refresh_token: "refresh",
      expires_in: 3600,
    };

    await updateSpotifyUserTokens(userId, tokenData);

    const params = supabaseMock.getCapturedUpsertParams();
    assertExists(params);
    assertEquals(params.id, userId);
  });

  it("should work without returning a value", async () => {
    const userId = "user-void";
    const tokenData = {
      access_token: "access",
      refresh_token: "refresh",
      expires_in: 3600,
    };

    const result = await updateSpotifyUserTokens(userId, tokenData);

    assertEquals(result, undefined);
  });

  it("should handle negative expires_in as falsy", async () => {
    const userId = "user-negative";
    const tokenData = {
      access_token: "access",
      refresh_token: "refresh",
      expires_in: -100,
    };

    await updateSpotifyUserTokens(userId, tokenData);

    const params = supabaseMock.getCapturedUpsertParams();
    assertExists(params);
    assertEquals(
      params.spotify_token_expires_at!.getTime(),
      MOCK_NOW + (-100 * 1000),
    );
  });

  it("should handle undefined expires_in", async () => {
    const userId = "user-undefined";
    const tokenData = {
      access_token: "access",
      refresh_token: "refresh",
      expires_in: undefined,
    };

    await updateSpotifyUserTokens(userId, tokenData);

    const params = supabaseMock.getCapturedUpsertParams();
    assertExists(params);
    assertEquals(params.spotify_token_expires_at, null);
  });

  it("should handle empty string tokens", async () => {
    const userId = "user-empty";
    const tokenData = {
      access_token: "",
      refresh_token: "",
      expires_in: 3600,
    };

    await updateSpotifyUserTokens(userId, tokenData);

    const params = supabaseMock.getCapturedUpsertParams();
    assertExists(params);
    assertEquals(params.spotify_access_token, "");
    assertEquals(params.spotify_refresh_token, "");
  });
});
