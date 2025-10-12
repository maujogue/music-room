import { Hono } from 'hono';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  authenticateUser,
  handleConnectionOpen,
  handleConnectionMessage,
  handleConnectionClose,
  handleConnectionError
} from '../handlers/connection.ts';
import { startVoteRealtime } from '../services/votes.ts';

const PORT = Number(Deno.env.get('PORT') || 8080);
const clientsByUser = new Map<string, Set<WebSocket>>();

const app = new Hono();

app.get('/ws', async (c) => {
  console.log('ws: connection attempt');
  const req = c.req.raw;

  // Check if it's a WebSocket upgrade request
  if (!req.headers.get('upgrade') || req.headers.get('upgrade')!.toLowerCase() !== 'websocket') {
    console.log('ws: not a websocket request');
    return c.text('Expected WebSocket upgrade', 400);
  }

  // Extract token from query parameters
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    console.log('ws: missing token');
    return c.text('Authentication token required', 401);
  }

  // Authenticate user
  const user = await authenticateUser(token);
  if (!user) {
    return c.text('Invalid or expired token', 401);
  }

  const { userId, userEmail } = user;
  const { socket, response } = Deno.upgradeWebSocket(req);

  // Set up WebSocket event handlers
  socket.onopen = () => {
    handleConnectionOpen(userId, userEmail, socket, clientsByUser);
  };

  socket.onmessage = async (event) => {
    await handleConnectionMessage(userId, userEmail, event, socket);
  };

  socket.onclose = (event) => {
    handleConnectionClose(userId, event, socket, clientsByUser);
  };

  socket.onerror = (error) => {
    handleConnectionError(userId, error);
  };

  return response;
});

// Initialize the server
async function initializeServer() {
  try {
    // Start realtime subscriptions
    await startVoteRealtime(clientsByUser);

    console.log('🚀 Hono WS server (Deno) listening on port', PORT);
    await serve(app.fetch, { port: PORT });
  } catch (error) {
    console.error('Failed to start server:', error);
    Deno.exit(1);
  }
}

// Start the server
initializeServer();
