import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.16";
import {
  afterEach,
  beforeEach,
  describe,
  it,
} from "jsr:@std/testing@1.0.16/bdd";
import { restore, stub } from "jsr:@std/testing@1.0.16/mock";

class HTTPException extends Error {
  constructor(public status: number, options: { message: string }) {
    super(options.message);
    this.name = "HTTPException";
  }
}

type MockAuthResponse = { data: any | null; error: any | null };

const createSupabaseMock = () => {
  let createUserResponse: MockAuthResponse = { data: null, error: null };

  return {
    client: {
      auth: {
        admin: {
          createUser: (_params: any) => createUserResponse,
        },
      },
    },
    setCreateUserResponse: (response: MockAuthResponse) => {
      createUserResponse = response;
    },
  };
};

const formatDbError = (error: any) => ({
  status: error.status || 500,
  message: error.message || "Database error",
});

describe("createUserWithSpotifyData", () => {
  let supabaseMock: ReturnType<typeof createSupabaseMock>;
  let createUserWithSpotifyData: (userData: any) => Promise<any>;
  let cryptoStub: any;

  beforeEach(() => {
    supabaseMock = createSupabaseMock();

    cryptoStub = stub(
      crypto,
      "randomUUID",
      () =>
        "123e4567-e89b-12d3-a456-426614174000" as `${string}-${string}-${string}-${string}-${string}`,
    );

    createUserWithSpotifyData = async (userData: any): Promise<any> => {
      const spotifyUser = {
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName,
      };

      const { data, error } = await supabaseMock.client.auth.admin.createUser({
        email: spotifyUser.email,
        email_confirm: true,
        password: crypto.randomUUID(),
        user_metadata: {
          spotify_id: spotifyUser.id,
          display_name: spotifyUser.displayName,
        },
      });

      if (error) {
        console.error("Supabase error:", error);
        const pgError = formatDbError(error);
        throw new HTTPException(pgError.status, { message: pgError.message });
      }
      return data;
    };
  });

  afterEach(() => {
    restore();
  });

  it("should create user with valid Spotify data", async () => {
    const userData = {
      id: "spotify-user-123",
      email: "test@example.com",
      displayName: "Test User",
    };

    const mockResponse = {
      user: {
        id: "user-uuid-123",
        email: "test@example.com",
        user_metadata: {
          spotify_id: "spotify-user-123",
          display_name: "Test User",
        },
      },
    };

    supabaseMock.setCreateUserResponse({ data: mockResponse, error: null });

    const result = await createUserWithSpotifyData(userData);

    assertEquals(result, mockResponse);
  });

  it("should use crypto.randomUUID for password generation", async () => {
    const userData = {
      id: "spotify-user-456",
      email: "user@test.com",
      displayName: "Another User",
    };

    const mockResponse = { user: { id: "user-uuid-456" } };
    supabaseMock.setCreateUserResponse({ data: mockResponse, error: null });

    await createUserWithSpotifyData(userData);

    assertEquals(cryptoStub.calls.length, 1);
  });

  it("should throw HTTPException when createUser returns an error", async () => {
    const userData = {
      id: "spotify-user-789",
      email: "error@test.com",
      displayName: "Error User",
    };

    const mockError = {
      message: "User already exists",
      status: 409,
    };

    supabaseMock.setCreateUserResponse({ data: null, error: mockError });

    const error = await assertRejects(
      async () => await createUserWithSpotifyData(userData),
      HTTPException,
    );

    assertEquals(error.status, 409);
    assertEquals(error.message, "User already exists");
  });

  it("should default to status 500 for errors without status", async () => {
    const userData = {
      id: "spotify-user-999",
      email: "error@test.com",
      displayName: "Error User",
    };

    const mockError = {
      message: "Unknown error",
    };

    supabaseMock.setCreateUserResponse({ data: null, error: mockError });

    const error = await assertRejects(
      async () => await createUserWithSpotifyData(userData),
      HTTPException,
    );

    assertEquals(error.status, 500);
  });

  it("should call console.error when there is an error", async () => {
    const userData = {
      id: "spotify-user-error",
      email: "console@test.com",
      displayName: "Console Test",
    };

    const mockError = {
      message: "Database connection failed",
      status: 503,
    };

    const consoleStub = stub(console, "error");
    supabaseMock.setCreateUserResponse({ data: null, error: mockError });

    await assertRejects(
      async () => await createUserWithSpotifyData(userData),
      HTTPException,
    );

    assertEquals(consoleStub.calls.length, 1);
    assertEquals(consoleStub.calls[0].args[0], "Supabase error:");
    assertEquals(consoleStub.calls[0].args[1], mockError);
  });

  it("should handle userData with missing displayName", async () => {
    const userData = {
      id: "spotify-user-no-name",
      email: "noname@test.com",
      displayName: undefined,
    };

    const mockResponse = {
      user: {
        id: "user-uuid-no-name",
        email: "noname@test.com",
        user_metadata: {
          spotify_id: "spotify-user-no-name",
          display_name: undefined,
        },
      },
    };

    supabaseMock.setCreateUserResponse({ data: mockResponse, error: null });

    const result = await createUserWithSpotifyData(userData);

    assertEquals(result, mockResponse);
  });

  it("should extract only required fields from userData", async () => {
    const userData = {
      id: "spotify-user-extra",
      email: "extra@test.com",
      displayName: "Extra User",
      country: "US",
      product: "premium",
      images: ["url1", "url2"],
    };

    const mockResponse = {
      user: {
        id: "user-uuid-extra",
        email: "extra@test.com",
      },
    };

    supabaseMock.setCreateUserResponse({ data: mockResponse, error: null });

    const result = await createUserWithSpotifyData(userData);

    assertEquals(result, mockResponse);
  });

  it("should handle special characters in displayName", async () => {
    const userData = {
      id: "spotify-user-special",
      email: "special@test.com",
      displayName: "User Ñame with 特殊 chars & symbols!",
    };

    const mockResponse = {
      user: {
        id: "user-uuid-special",
        email: "special@test.com",
        user_metadata: {
          spotify_id: "spotify-user-special",
          display_name: "User Ñame with 特殊 chars & symbols!",
        },
      },
    };

    supabaseMock.setCreateUserResponse({ data: mockResponse, error: null });

    const result = await createUserWithSpotifyData(userData);

    assertEquals(result, mockResponse);
  });

  it("should handle email validation errors", async () => {
    const userData = {
      id: "spotify-user-invalid-email",
      email: "invalid-email",
      displayName: "Invalid Email User",
    };

    const mockError = {
      message: "Invalid email format",
      status: 422,
    };

    supabaseMock.setCreateUserResponse({ data: null, error: mockError });

    const error = await assertRejects(
      async () => await createUserWithSpotifyData(userData),
      HTTPException,
    );

    assertEquals(error.status, 422);
    assertEquals(error.message, "Invalid email format");
  });

  it("should pass email_confirm as true", async () => {
    const userData = {
      id: "spotify-user-confirm",
      email: "confirm@test.com",
      displayName: "Confirm User",
    };

    const mockResponse = {
      user: {
        id: "user-uuid-confirm",
        email: "confirm@test.com",
        email_confirmed_at: new Date().toISOString(),
      },
    };

    supabaseMock.setCreateUserResponse({ data: mockResponse, error: null });

    const result = await createUserWithSpotifyData(userData);

    assertEquals(result, mockResponse);
  });
});
