// @ts-ignore: Deno edge runtime provides module resolution at runtime.
import {
  authenticateUser,
  handleConnectionClose,
  handleConnectionError,
  handleConnectionMessage,
  handleConnectionOpen,
  // @ts-ignore: Exported types are provided by Deno runtime at execution.
} from "./handlers/connection.ts";
// @ts-ignore: Deno edge runtime provides module resolution at runtime.
import { startVoteRealtime } from "./services/votes.ts";

// Global clients map for the edge function
const clientsByUser = new Map<string, Set<WebSocket>>();

// Maps each socket to the eventId it connected with
const socketEventMap = new Map<WebSocket, string>();

// Initialize realtime subscriptions once
let realtimeInitialized = false;

// Main handler for Edge Function
async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Initialize realtime subscriptions once per cold start
  if (!realtimeInitialized) {
    try {
      await startVoteRealtime(clientsByUser);
      realtimeInitialized = true;
      console.info("Realtime subscriptions initialized");
    } catch (error) {
      console.error("Failed to initialize realtime:", error);
    }
  }

  // Check if it's a WebSocket upgrade request
  if (
    !request.headers.get("upgrade") ||
    request.headers.get("upgrade")!.toLowerCase() !== "websocket"
  ) {
    return new Response("Expected WebSocket upgrade", { status: 400 });
  }

  // Extract token from query parameters
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Authentication token required", { status: 401 });
  }

  // Authenticate user
  const user = await authenticateUser(token);
  if (!user) {
    return new Response("Invalid or expired token", { status: 401 });
  }

  const { userId, userEmail } = user;
  const eventId = url.searchParams.get("eventId") ?? undefined;

  // @ts-ignore: Deno.upgradeWebSocket is available at runtime.
  const { socket, response } = Deno.upgradeWebSocket(request);

  // Set up WebSocket event handlers
  socket.onopen = () => {
    handleConnectionOpen(userId, userEmail, socket, clientsByUser, socketEventMap, eventId);
  };

  socket.onmessage = async (event) => {
    await handleConnectionMessage(userId, userEmail, event, socket);
  };

  socket.onclose = (event) => {
    handleConnectionClose(userId, event, socket, clientsByUser, socketEventMap);
  };

  socket.onerror = (error) => {
    handleConnectionError(userId, error, socket, clientsByUser);
  };

  return response;
}

// Export the handler for Edge Function
// @ts-ignore: Deno.serve is provided by the edge runtime.
Deno.serve(handler);
