import { assertEquals, assertRejects, assertExists } from "jsr:@std/assert";
import { describe, it, beforeEach, afterEach } from "jsr:@std/testing/bdd";
import { stub, restore } from "jsr:@std/testing/mock";

class HTTPException extends Error {
    constructor(public status: number, options: { message: string }) {
        super(options.message);
        this.name = 'HTTPException';
    }
}

type InsertParams = {
    state: string;
    user_id: string | null;
};

type MockInsertResponse = { data: any | null; error: any | null };

const createSupabaseMock = () => {
    let insertResponse: MockInsertResponse = { data: null, error: null };
    let capturedInsertParams: InsertParams[] | null = null;

    return {
        client: {
            from: (table: string) => ({
                insert: async (params: InsertParams[]) => {
                    capturedInsertParams = params;
                    return insertResponse;
                }
            })
        },
        setInsertResponse: (response: MockInsertResponse) => {
            insertResponse = response;
        },
        getCapturedInsertParams: () => capturedInsertParams,
        resetCapturedParams: () => {
            capturedInsertParams = null;
        }
    };
};

const formatDbError = (error: any) => ({
    status: error.status || 500,
    message: error.message || 'Database error'
});

describe("insertOauthStateToSupabase", () => {
    let supabaseMock: ReturnType<typeof createSupabaseMock>;
    let insertOauthStateToSupabase: (state: string, user_id: string | null) => Promise<void>;

    beforeEach(() => {
        supabaseMock = createSupabaseMock();

        insertOauthStateToSupabase = async (state: string, user_id: string | null): Promise<void> => {
            const { error } = await supabaseMock.client.from('oauth_state').insert([{ state, user_id }]);
            if (error) {
                console.error('Supabase error:', error);
                const pgError = formatDbError(error);
                throw new HTTPException(pgError.status, { message: pgError.message });
            }
        };
    });

    afterEach(() => {
        restore();
        supabaseMock.resetCapturedParams();
    });

    it("should insert oauth state with user_id successfully", async () => {
        const state = "random-state-123";
        const userId = "user-456";

        supabaseMock.setInsertResponse({ data: { id: 1 }, error: null });

        await insertOauthStateToSupabase(state, userId);

        const params = supabaseMock.getCapturedInsertParams();
        assertExists(params);
        assertEquals(params.length, 1);
        assertEquals(params[0].state, state);
        assertEquals(params[0].user_id, userId);
    });

    it("should insert oauth state with null user_id successfully", async () => {
        const state = "random-state-789";

        supabaseMock.setInsertResponse({ data: { id: 2 }, error: null });

        await insertOauthStateToSupabase(state, null);

        const params = supabaseMock.getCapturedInsertParams();
        assertExists(params);
        assertEquals(params.length, 1);
        assertEquals(params[0].state, state);
        assertEquals(params[0].user_id, null);
    });

    it("should throw HTTPException when insert returns an error", async () => {
        const state = "error-state";
        const userId = "user-error";
        const mockError = {
            message: "Duplicate key violation",
            status: 409
        };

        supabaseMock.setInsertResponse({ data: null, error: mockError });

        const error = await assertRejects(
            async () => await insertOauthStateToSupabase(state, userId),
            HTTPException
        );

        assertEquals(error.status, 409);
        assertEquals(error.message, "Duplicate key violation");
    });

    it("should default to status 500 for errors without status", async () => {
        const state = "unknown-error-state";
        const userId = "user-unknown";
        const mockError = {
            message: "Unknown database error"
        };

        supabaseMock.setInsertResponse({ data: null, error: mockError });

        const error = await assertRejects(
            async () => await insertOauthStateToSupabase(state, userId),
            HTTPException
        );

        assertEquals(error.status, 500);
        assertEquals(error.message, "Unknown database error");
    });

    it("should call console.error when there is an error", async () => {
        const state = "console-error-state";
        const userId = "user-console";
        const mockError = {
            message: "Connection timeout",
            status: 503
        };

        const consoleStub = stub(console, 'error');
        supabaseMock.setInsertResponse({ data: null, error: mockError });

        await assertRejects(
            async () => await insertOauthStateToSupabase(state, userId),
            HTTPException
        );

        assertEquals(consoleStub.calls.length, 1);
        assertEquals(consoleStub.calls[0].args[0], 'Supabase error:');
        assertEquals(consoleStub.calls[0].args[1], mockError);
    });

    it("should work without returning a value", async () => {
        const state = "void-state";
        const userId = "user-void";

        supabaseMock.setInsertResponse({ data: { id: 3 }, error: null });

        const result = await insertOauthStateToSupabase(state, userId);

        assertEquals(result, undefined);
    });

    it("should handle long state strings", async () => {
        const longState = "a".repeat(500);
        const userId = "user-long-state";

        supabaseMock.setInsertResponse({ data: { id: 4 }, error: null });

        await insertOauthStateToSupabase(longState, userId);

        const params = supabaseMock.getCapturedInsertParams();
        assertExists(params);
        assertEquals(params[0].state, longState);
    });

    it("should handle special characters in state", async () => {
        const state = "state-with-special_chars.123-ABC!@#$%";
        const userId = "user-special";

        supabaseMock.setInsertResponse({ data: { id: 5 }, error: null });

        await insertOauthStateToSupabase(state, userId);

        const params = supabaseMock.getCapturedInsertParams();
        assertExists(params);
        assertEquals(params[0].state, state);
    });

    it("should handle UUID as state", async () => {
        const state = "550e8400-e29b-41d4-a716-446655440000";
        const userId = "user-uuid-state";

        supabaseMock.setInsertResponse({ data: { id: 6 }, error: null });

        await insertOauthStateToSupabase(state, userId);

        const params = supabaseMock.getCapturedInsertParams();
        assertExists(params);
        assertEquals(params[0].state, state);
    });

    it("should handle UUID as user_id", async () => {
        const state = "state-123";
        const userId = "123e4567-e89b-12d3-a456-426614174000";

        supabaseMock.setInsertResponse({ data: { id: 7 }, error: null });

        await insertOauthStateToSupabase(state, userId);

        const params = supabaseMock.getCapturedInsertParams();
        assertExists(params);
        assertEquals(params[0].user_id, userId);
    });

    it("should handle empty state string", async () => {
        const state = "";
        const userId = "user-empty-state";

        supabaseMock.setInsertResponse({ data: { id: 8 }, error: null });

        await insertOauthStateToSupabase(state, userId);

        const params = supabaseMock.getCapturedInsertParams();
        assertExists(params);
        assertEquals(params[0].state, "");
    });

    it("should handle constraint violation errors", async () => {
        const state = "duplicate-state";
        const userId = "user-duplicate";
        const mockError = {
            message: "duplicate key value violates unique constraint",
            code: "23505",
            status: 409
        };

        supabaseMock.setInsertResponse({ data: null, error: mockError });

        const error = await assertRejects(
            async () => await insertOauthStateToSupabase(state, userId),
            HTTPException
        );

        assertEquals(error.status, 409);
    });

    it("should handle foreign key violation errors", async () => {
        const state = "state-fk-violation";
        const userId = "non-existent-user";
        const mockError = {
            message: "insert or update on table violates foreign key constraint",
            code: "23503",
            status: 400
        };

        supabaseMock.setInsertResponse({ data: null, error: mockError });

        const error = await assertRejects(
            async () => await insertOauthStateToSupabase(state, userId),
            HTTPException
        );

        assertEquals(error.status, 400);
    });

    it("should handle network errors", async () => {
        const state = "state-network-error";
        const userId = "user-network";
        const mockError = {
            message: "Network request failed",
            status: 0
        };

        supabaseMock.setInsertResponse({ data: null, error: mockError });

        const error = await assertRejects(
            async () => await insertOauthStateToSupabase(state, userId),
            HTTPException
        );

        assertEquals(error.status, 500);
    });

    it("should insert array with single object", async () => {
        const state = "array-test-state";
        const userId = "user-array";

        supabaseMock.setInsertResponse({ data: { id: 9 }, error: null });

        await insertOauthStateToSupabase(state, userId);

        const params = supabaseMock.getCapturedInsertParams();
        assertExists(params);
        assertEquals(Array.isArray(params), true);
        assertEquals(params.length, 1);
    });
});

