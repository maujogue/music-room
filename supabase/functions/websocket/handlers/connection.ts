import { createClient } from "@supabase/supabase-js";
import { addClient, removeClient } from '../core/websocket_manager.ts';
import { handleMessage, WebSocketMessage } from './message.ts';
import { sendErrorMessage, sendMessage } from './error.ts';


const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('_SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('_SUPABASE_SERVICE_ROLE_KEY')!;

console.log('🔧 Supabase config:', {
  url: SUPABASE_URL ? 'SET' : 'MISSING',
  key: SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
});

export interface AuthenticatedUser {
  userId: string;
  userEmail: string;
}

// Authenticate user with token
export async function authenticateUser(token: string): Promise<AuthenticatedUser | null> {
  try {
    console.log('🔐 ws: validating token (length:', token, ')');

    const { error, data: sessionData } = await supabase.auth.getUser(token)

    if (error || !sessionData?.user) {
      console.error('❌ ws: session validation failed:', error?.message || 'No user data');
      return null;
    }

    const userId = sessionData.user.id;
    const userEmail = sessionData.user.email || 'unknown';

    console.log('✅ ws: user authenticated:', { userId, email: userEmail });
    return { userId, userEmail };
  } catch (err) {
    console.error('💥 ws: authentication error:', err);
    return null;
  }
}

// Handle WebSocket connection open
export function handleConnectionOpen(
  userId: string,
  userEmail: string,
  socket: WebSocket,
  clientsByUser: Map<string, Set<WebSocket>>
): void {
  console.log('ws: connection established for user:', { userId, email: userEmail });

  // Close any existing connection for this user (single connection per user)
  const existingSocket = clientsByUser.get(userId);
  if (existingSocket && existingSocket.size > 0) {
    console.log('ws: closing existing connections for user:', userId);
    for (const ws of existingSocket) {
      if (ws !== socket) {
        try {
          ws.close(1000, 'New connection established');
        } catch (error) {
          console.warn('ws: error closing existing connection:', error);
        }
      }
    }
  }

  addClient(userId, socket, clientsByUser);

  // Send authentication success message
  sendMessage(socket, {
    type: 'connected',
    userId,
    email: userEmail,
    message: 'Successfully authenticated and connected'
  });
}

// Handle WebSocket message
export async function handleConnectionMessage(
  userId: string,
  userEmail: string,
  event: MessageEvent,
  socket: WebSocket
): Promise<void> {
  try {
    if (typeof event.data === 'string') {
      const message: WebSocketMessage = JSON.parse(event.data);
      await handleMessage(userId, userEmail, message, socket);
    }
  } catch (error) {
    console.warn('ws: invalid message from user', { userId, error });
    sendErrorMessage(socket, 'Invalid message format');
  }
}

// Handle WebSocket connection close
export function handleConnectionClose(
  userId: string,
  event: CloseEvent,
  socket: WebSocket,
  clientsByUser: Map<string, Set<WebSocket>>
): void {
  console.log('ws: connection closed for user:', {
    userId,
    code: event.code,
    reason: event.reason
  });
  removeClient(userId, socket, clientsByUser);
}

// Handle WebSocket error
export function handleConnectionError(
  userId: string,
  error: Event,
  socket: WebSocket,
  clientsByUser: Map<string, Set<WebSocket>>
): void {
  console.error('ws: socket error for user:', {
    userId,
    errorType: error.type,
    timestamp: new Date().toISOString()
  });

  // Tenter de nettoyer la connexion défaillante
  try {
    removeClient(userId, socket, clientsByUser);

    // Optionnel : envoyer un message d'erreur si la socket est encore ouverte
    if (socket.readyState === WebSocket.OPEN) {
      sendErrorMessage(socket, 'Connection error occurred, please reconnect');
    }
  } catch (cleanupError) {
    console.error('ws: error during socket cleanup:', cleanupError);
  }

  // Log détaillé pour debug
  console.error('ws: connection error details:', {
    userId,
    readyState: socket.readyState,
    url: socket.url,
    protocol: socket.protocol
  });
}
