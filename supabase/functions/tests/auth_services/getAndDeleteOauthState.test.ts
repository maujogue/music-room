import { assertEquals, assertRejects } from "jsr:@std/assert";
import { describe, it, beforeEach, afterEach } from "jsr:@std/testing/bdd";
import { stub, restore } from "jsr:@std/testing/mock";

class HTTPException extends Error {
    constructor(public status: number, options: { message: string }) {
        super(options.message);
        this.name = 'HTTPException';
    }
}

type MockResponse<T> = { data: T | null; error: any | null };

const createSupabaseMock = () => {
    let selectResponse: MockResponse<any> = { data: null, error: null };
    let deleteResponse: { error: any | null } = { error: null };

    return {
        client: {
            from: (table: string) => ({
                select: (columns: string) => ({
                    eq: (column: string, value: string) => ({
                        single: async () => selectResponse
                    })
                }),
                delete: () => ({
                    eq: (column: string, value: string) => deleteResponse
                })
            })
        },
        setSelectResponse: (response: MockResponse<any>) => {
            selectResponse = response;
        },
        setDeleteResponse: (response: { error: any | null }) => {
            deleteResponse = response;
        }
    };
};

const formatDbError = (error: any) => ({
    status: 500,
    message: 'Database error'
});

describe("getAndDeleteOauthState", () => {
    let supabaseMock: ReturnType<typeof createSupabaseMock>;
    let getAndDeleteOauthState: (state: string) => Promise<string | null>;

    beforeEach(() => {
        supabaseMock = createSupabaseMock();

        getAndDeleteOauthState = async (state: string): Promise<string | null> => {
            const { data, error } = await supabaseMock.client
                .from('oauth_state')
                .select('*')
                .eq('state', state)
                .single();

            if (error) {
                console.error('Supabase error:', error);
                const pgError = formatDbError(error);
                throw new HTTPException(pgError.status, { message: pgError.message });
            }

            if (!data) {
                throw new HTTPException(400, { message: 'Invalid state parameter' });
            }

            const { error: deleteError } = await supabaseMock.client
                .from('oauth_state')
                .delete()
                .eq('state', state);

            if (deleteError) {
                console.error('Supabase error:', deleteError);
                const pgError = formatDbError(deleteError);
                throw new HTTPException(pgError.status, { message: pgError.message });
            }

            return data.user_id;
        };
    });

    afterEach(() => {
        restore();
    });

    it("should return user_id when everything works correctly", async () => {
        const mockData = { user_id: "user-123", state: "valid-state" };

        supabaseMock.setSelectResponse({ data: mockData, error: null });
        supabaseMock.setDeleteResponse({ error: null });

        const result = await getAndDeleteOauthState("valid-state");

        assertEquals(result, "user-123");
    });

    it("should return user_id even if user_id is null", async () => {
        const mockData = { user_id: null, state: "valid-state" };

        supabaseMock.setSelectResponse({ data: mockData, error: null });
        supabaseMock.setDeleteResponse({ error: null });

        const result = await getAndDeleteOauthState("valid-state");

        assertEquals(result, null);
    });

    it("should throw a HTTPException with a 400 status when data is null", async () => {
        supabaseMock.setSelectResponse({ data: null, error: null });

        const error = await assertRejects(
            async () => await getAndDeleteOauthState("invalid-state"),
            HTTPException
        );

        assertEquals(error.status, 400);
        assertEquals(error.message, "Invalid state parameter");
    });

    it("should return a HTTPException when select return an error", async () => {
        const mockError = { message: "Database connection failed", code: "CONNECTION_ERROR" };

        supabaseMock.setSelectResponse({ data: null, error: mockError });

        const error = await assertRejects(
            async () => await getAndDeleteOauthState("error-state"),
            HTTPException
        );

        assertEquals(error.status, 500);
        assertEquals(error.message, "Database error");
    });

    it("should throw a HTTPException whem delete return an error", async () => {
        const mockData = { user_id: "user-456", state: "valid-state" };
        const mockDeleteError = { message: "Delete operation failed", code: "DELETE_ERROR" };

        supabaseMock.setSelectResponse({ data: mockData, error: null });
        supabaseMock.setDeleteResponse({ error: mockDeleteError });

        const error = await assertRejects(
            async () => await getAndDeleteOauthState("valid-state"),
            HTTPException
        );

        assertEquals(error.status, 500);
        assertEquals(error.message, "Database error");
    });

    it("should handle empty states", async () => {
        supabaseMock.setSelectResponse({ data: null, error: null });

        const error = await assertRejects(
            async () => await getAndDeleteOauthState(""),
            HTTPException
        );

        assertEquals(error.status, 400);
        assertEquals(error.message, "Invalid state parameter");
    });

    it("should call console.error when there is an select error", async () => {
        const mockError = { message: "Test error", code: "TEST_ERROR" };
        const consoleStub = stub(console, 'error');

        supabaseMock.setSelectResponse({ data: null, error: mockError });

        await assertRejects(
            async () => await getAndDeleteOauthState("test"),
            HTTPException
        );

        assertEquals(consoleStub.calls.length, 1);
        assertEquals(consoleStub.calls[0].args[0], 'Supabase error:');
        assertEquals(consoleStub.calls[0].args[1], mockError);
    });

    it("should call console.error when there is an delete error", async () => {
        const mockData = { user_id: "user-789", state: "test" };
        const mockDeleteError = { message: "Delete error", code: "DELETE_ERROR" };
        const consoleStub = stub(console, 'error');

        supabaseMock.setSelectResponse({ data: mockData, error: null });
        supabaseMock.setDeleteResponse({ error: mockDeleteError });

        await assertRejects(
            async () => await getAndDeleteOauthState("test"),
            HTTPException
        );

        assertEquals(consoleStub.calls.length, 1);
        assertEquals(consoleStub.calls[0].args[0], 'Supabase error:');
        assertEquals(consoleStub.calls[0].args[1], mockDeleteError);
    });

    it("should work with different user_ids", async () => {
        const testCases = [
            "user-abc-123",
            "12345",
            "uuid-format-user-id"
        ];

        for (const userId of testCases) {
            const mockData = { user_id: userId, state: "test-state" };

            supabaseMock.setSelectResponse({ data: mockData, error: null });
            supabaseMock.setDeleteResponse({ error: null });

            const result = await getAndDeleteOauthState("test-state");

            assertEquals(result, userId);
        }
    });
});


