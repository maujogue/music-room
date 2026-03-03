import { createClient } from "@supabase/supabase-js";
import { addClient, removeClient } from "../core/websocket_manager.ts";
import { handleMessage, WebSocketMessage } from "./message.ts";
import { sendErrorMessage, sendMessage } from "./error.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ||
  Deno.env.get("_SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("_SUPABASE_SERVICE_ROLE_KEY")!;

// Supabase config loaded

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export interface AuthenticatedUser {
  userId: string;
  userEmail: string;
}

export async function authenticateUser(
  token: string,
): Promise<AuthenticatedUser | null> {
  try {
    // validating token

    const { error, data: sessionData } = await supabase.auth.getUser(token);

    if (error || !sessionData?.user) {
      console.error(
        "❌ ws: session validation failed:",
        error?.message || "No user data",
      );
      return null;
    }

    const userId = sessionData.user.id;
    const userEmail = sessionData.user.email || "unknown";

    // user authenticated
    return { userId, userEmail };
  } catch (err) {
    console.error("💥 ws: authentication error:", err);
    return null;
  }
}

export function handleConnectionOpen(
  userId: string,
  userEmail: string,
  socket: WebSocket,
  clientsByUser: Map<string, Set<WebSocket>>,
  socketEventMap: Map<WebSocket, string>,
  eventId?: string,
): void {
  // connection established for user

  const existingSocket = clientsByUser.get(userId);
  if (existingSocket && existingSocket.size > 0) {
    for (const ws of existingSocket) {
      if (ws !== socket) {
        try {
          ws.close(1000, "New connection established");
        } catch (error) {
          console.warn("ws: error closing existing connection:", error);
        }
      }
    }
  }

  addClient(userId, socket, clientsByUser);

  if (eventId) {
    socketEventMap.set(socket, eventId);
  }

  sendMessage(socket, {
    type: "connected",
    userId,
    email: userEmail,
    eventId: eventId ?? null,
    message: "Successfully authenticated and connected",
  });
}

export async function handleConnectionMessage(
  userId: string,
  userEmail: string,
  event: MessageEvent,
  socket: WebSocket,
): Promise<void> {
  try {
    if (typeof event.data === "string") {
      const message: WebSocketMessage = JSON.parse(event.data);
      await handleMessage(userId, userEmail, message, socket);
    }
  } catch (error) {
    console.warn("ws: invalid message from user", { userId, error });
    sendErrorMessage(socket, "Invalid message format");
  }
}

export function handleConnectionClose(
  userId: string,
  _event: CloseEvent,
  socket: WebSocket,
  clientsByUser: Map<string, Set<WebSocket>>,
  socketEventMap: Map<WebSocket, string>,
): void {
  // connection closed for user
  removeClient(userId, socket, clientsByUser);
  socketEventMap.delete(socket);
}

export function handleConnectionError(
  userId: string,
  error: Event,
  socket: WebSocket,
  clientsByUser: Map<string, Set<WebSocket>>,
): void {
  console.error("ws: socket error for user:", {
    userId,
    errorType: error.type,
    timestamp: new Date().toISOString(),
  });

  try {
    removeClient(userId, socket, clientsByUser);

    if (socket.readyState === WebSocket.OPEN) {
      sendErrorMessage(socket, "Connection error occurred, please reconnect");
    }
  } catch (cleanupError) {
    console.error("ws: error during socket cleanup:", cleanupError);
  }
  console.error("ws: connection error details:", {
    userId,
    readyState: socket.readyState,
    url: socket.url,
    protocol: socket.protocol,
  });
}
