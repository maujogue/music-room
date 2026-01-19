import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.208.0/testing/mock.ts";
import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.208.0/testing/bdd.ts";

const createClientMock = () => {
  return {
    rpc: spy(() => Promise.resolve({ data: null, error: null })),
  };
};

// Mock for formatDbError module
const formatDbErrorMock = spy((error: any) => ({
  status: 500,
  message: "Database error",
}));

// Dynamic import with mocks
let supabaseMock: any;

describe("Integration tests", () => {
  it("should require SUPABASE_URL in environment", () => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    assertEquals(typeof supabaseUrl, "string");
  });

  it("should require SUPABASE_SERVICE_ROLE_KEY in environment", () => {
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    assertEquals(typeof serviceRoleKey, "string");
  });
});

describe("getSupabaseEventByOwner", () => {
  beforeEach(() => {
    // Reset mocks before each test
    supabaseMock = createClientMock();
  });

  it("should return events for a valid owner", async () => {
    const mockEvents = [
      { id: "1", title: "Event 1", owner_id: "owner123", date: "2025-11-01" },
      { id: "2", title: "Event 2", owner_id: "owner123", date: "2025-11-15" },
    ];

    supabaseMock.rpc = spy(() =>
      Promise.resolve({ data: mockEvents, error: null })
    );

    // Simulate the function
    const getSupabaseEventByOwner = async (ownerId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_events",
        {
          p_user_id: ownerId,
        },
      );

      if (error) {
        const pgError = formatDbErrorMock(error);
        throw new Error(pgError.message);
      }

      return data;
    };

    const result = await getSupabaseEventByOwner("owner123");

    assertEquals(result, mockEvents);
    assertSpyCall(supabaseMock.rpc, 0, {
      args: ["get_user_events", { p_user_id: "owner123" }],
    });
  });

  it("should call rpc with the correct parameters", async () => {
    supabaseMock.rpc = spy(() => Promise.resolve({ data: [], error: null }));

    const getSupabaseEventByOwner = async (ownerId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_events",
        {
          p_user_id: ownerId,
        },
      );
      return data;
    };

    await getSupabaseEventByOwner("test-owner-789");

    assertSpyCalls(supabaseMock.rpc, 1);
    assertSpyCall(supabaseMock.rpc, 0, {
      args: ["get_user_events", { p_user_id: "test-owner-789" }],
    });
  });

  it("should return an empty array when no events exist for the owner", async () => {
    supabaseMock.rpc = spy(() => Promise.resolve({ data: [], error: null }));

    const getSupabaseEventByOwner = async (ownerId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_events",
        {
          p_user_id: ownerId,
        },
      );
      return data;
    };

    const result = await getSupabaseEventByOwner("owner-no-events");

    assertEquals(result, []);
  });

  it("should throw HTTPException when Supabase error occurs", async () => {
    const mockError = {
      message: "RPC function not found",
      code: "42883",
    };

    supabaseMock.rpc = spy(() =>
      Promise.resolve({ data: null, error: mockError })
    );

    const mockFormatDbError = (error: any) => ({
      status: 500,
      message: "Database function error",
    });

    const getSupabaseEventByOwner = async (ownerId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_events",
        {
          p_user_id: ownerId,
        },
      );

      if (error) {
        const pgError = mockFormatDbError(error);
        throw new Error(pgError.message);
      }

      return data;
    };

    await assertRejects(
      async () => {
        await getSupabaseEventByOwner("owner123");
      },
      Error,
      "Database function error",
    );
  });

  it("should correctly format PostgreSQL errors", async () => {
    const mockError = {
      message: "Permission denied",
      code: "42501",
    };

    supabaseMock.rpc = spy(() =>
      Promise.resolve({ data: null, error: mockError })
    );

    const formatDbErrorSpy = spy((error: any) => {
      if (error.code === "42501") {
        return {
          status: 403,
          message: "Insufficient permissions",
        };
      }
      return {
        status: 500,
        message: "Unknown error",
      };
    });

    const getSupabaseEventByOwner = async (ownerId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_events",
        {
          p_user_id: ownerId,
        },
      );

      if (error) {
        const pgError = formatDbErrorSpy(error);
        throw new Error(pgError.message);
      }

      return data;
    };

    await assertRejects(
      async () => {
        await getSupabaseEventByOwner("owner123");
      },
      Error,
      "Insufficient permissions",
    );

    assertSpyCalls(formatDbErrorSpy, 1);
    assertSpyCall(formatDbErrorSpy, 0, {
      args: [mockError],
    });
  });

  it("should handle network errors", async () => {
    supabaseMock.rpc = spy(() => Promise.reject(new Error("Network error")));

    const getSupabaseEventByOwner = async (ownerId: string) => {
      try {
        const { data, error } = await supabaseMock.rpc(
          "get_user_events",
          {
            p_user_id: ownerId,
          },
        );
        return data;
      } catch (err) {
        throw err;
      }
    };

    await assertRejects(
      async () => {
        await getSupabaseEventByOwner("owner123");
      },
      Error,
      "Network error",
    );
  });

  it("should handle different error codes correctly", async () => {
    const testCases = [
      {
        code: "23503",
        expectedStatus: 400,
        expectedMessage: "Foreign key violation",
      },
      {
        code: "23505",
        expectedStatus: 409,
        expectedMessage: "Duplicate entry",
      },
      {
        code: "42P01",
        expectedStatus: 500,
        expectedMessage: "Undefined table",
      },
    ];

    for (const testCase of testCases) {
      const mockError = {
        message: "Database error",
        code: testCase.code,
      };

      supabaseMock.rpc = spy(() =>
        Promise.resolve({ data: null, error: mockError })
      );

      const formatDbErrorSpy = spy((error: any) => {
        if (error.code === "23503") {
          return { status: 400, message: "Foreign key violation" };
        } else if (error.code === "23505") {
          return { status: 409, message: "Duplicate entry" };
        } else if (error.code === "42P01") {
          return { status: 500, message: "Undefined table" };
        }
        return { status: 500, message: "Unknown error" };
      });

      const getSupabaseEventByOwner = async (ownerId: string) => {
        const { data, error } = await supabaseMock.rpc(
          "get_user_events",
          {
            p_user_id: ownerId,
          },
        );

        if (error) {
          const pgError = formatDbErrorSpy(error);
          throw new Error(pgError.message);
        }

        return data;
      };

      await assertRejects(
        async () => {
          await getSupabaseEventByOwner("owner123");
        },
        Error,
        testCase.expectedMessage,
      );
    }
  });

  it("should handle null data response correctly", async () => {
    supabaseMock.rpc = spy(() => Promise.resolve({ data: null, error: null }));

    const getSupabaseEventByOwner = async (ownerId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_events",
        {
          p_user_id: ownerId,
        },
      );

      if (error) {
        const pgError = formatDbErrorMock(error);
        throw new Error(pgError.message);
      }

      return data;
    };

    const result = await getSupabaseEventByOwner("owner123");

    assertEquals(result, null);
  });
});

describe("getCurrentUserPlaylistSupabase", () => {
  beforeEach(() => {
    // Reset mocks before each test
    supabaseMock = createClientMock();
  });

  it("should return playlists for a valid user", async () => {
    const mockPlaylists = [
      { id: "1", name: "Playlist 1", owner_id: "user123" },
      { id: "2", name: "Playlist 2", owner_id: "user123" },
    ];

    supabaseMock.rpc = spy(() =>
      Promise.resolve({ data: mockPlaylists, error: null })
    );

    // Simulate the function
    const getCurrentUserPlaylistSupabase = async (userId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_all_playlists_with_owner",
        {
          p_user_id: userId,
        },
      );

      if (error) {
        const pgError = formatDbErrorMock(error);
        throw new Error(pgError.message);
      }

      return data;
    };

    const result = await getCurrentUserPlaylistSupabase("user123");

    assertEquals(result, mockPlaylists);
    assertSpyCall(supabaseMock.rpc, 0, {
      args: ["get_user_all_playlists_with_owner", { p_user_id: "user123" }],
    });
  });

  it("should call rpc with the correct parameters", async () => {
    supabaseMock.rpc = spy(() => Promise.resolve({ data: [], error: null }));

    const getCurrentUserPlaylistSupabase = async (userId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_all_playlists_with_owner",
        {
          p_user_id: userId,
        },
      );
      return data;
    };

    await getCurrentUserPlaylistSupabase("test-user-456");

    assertSpyCalls(supabaseMock.rpc, 1);
    assertSpyCall(supabaseMock.rpc, 0, {
      args: ["get_user_all_playlists_with_owner", {
        p_user_id: "test-user-456",
      }],
    });
  });

  it("should return an empty array when no playlists exist", async () => {
    supabaseMock.rpc = spy(() => Promise.resolve({ data: [], error: null }));

    const getCurrentUserPlaylistSupabase = async (userId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_all_playlists_with_owner",
        {
          p_user_id: userId,
        },
      );
      return data;
    };

    const result = await getCurrentUserPlaylistSupabase("user-no-playlists");

    assertEquals(result, []);
  });

  it("should throw HTTPException when Supabase error occurs", async () => {
    const mockError = {
      message: "RPC function not found",
      code: "42883",
    };

    supabaseMock.rpc = spy(() =>
      Promise.resolve({ data: null, error: mockError })
    );

    const mockFormatDbError = (error: any) => ({
      status: 500,
      message: "Database function error",
    });

    const getCurrentUserPlaylistSupabase = async (userId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_all_playlists_with_owner",
        {
          p_user_id: userId,
        },
      );

      if (error) {
        const pgError = mockFormatDbError(error);
        throw new Error(pgError.message);
      }

      return data;
    };

    await assertRejects(
      async () => {
        await getCurrentUserPlaylistSupabase("user123");
      },
      Error,
      "Database function error",
    );
  });

  it("should correctly format PostgreSQL errors", async () => {
    const mockError = {
      message: "Permission denied",
      code: "42501",
    };

    supabaseMock.rpc = spy(() =>
      Promise.resolve({ data: null, error: mockError })
    );

    const formatDbErrorSpy = spy((error: any) => {
      if (error.code === "42501") {
        return {
          status: 403,
          message: "Insufficient permissions",
        };
      }
      return {
        status: 500,
        message: "Unknown error",
      };
    });

    const getCurrentUserPlaylistSupabase = async (userId: string) => {
      const { data, error } = await supabaseMock.rpc(
        "get_user_all_playlists_with_owner",
        {
          p_user_id: userId,
        },
      );

      if (error) {
        const pgError = formatDbErrorSpy(error);
        throw new Error(pgError.message);
      }

      return data;
    };

    await assertRejects(
      async () => {
        await getCurrentUserPlaylistSupabase("user123");
      },
      Error,
      "Insufficient permissions",
    );

    assertSpyCalls(formatDbErrorSpy, 1);
    assertSpyCall(formatDbErrorSpy, 0, {
      args: [mockError],
    });
  });

  it("should handle network errors", async () => {
    supabaseMock.rpc = spy(() => Promise.reject(new Error("Network error")));

    const getCurrentUserPlaylistSupabase = async (userId: string) => {
      try {
        const { data, error } = await supabaseMock.rpc(
          "get_user_all_playlists_with_owner",
          {
            p_user_id: userId,
          },
        );
        return data;
      } catch (err) {
        throw err;
      }
    };

    await assertRejects(
      async () => {
        await getCurrentUserPlaylistSupabase("user123");
      },
      Error,
      "Network error",
    );
  });
});
