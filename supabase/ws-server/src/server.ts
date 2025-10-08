import { Hono } from 'hono';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "http://localhost:54321";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PORT = Number(Deno.env.get('PORT') || 8080);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const app = new Hono();

type DenoteWebSocket = WebSocket;
const clientsByUser = new Map<string, Set<DenoteWebSocket>>();

function addClient(userId: string, ws: DenoteWebSocket) {
  let s = clientsByUser.get(userId);
  if (!s) { s = new Set(); clientsByUser.set(userId, s); }
  s.add(ws);
}

function removeClient(userId: string, ws: DenoteWebSocket) {
  const s = clientsByUser.get(userId);
  if (!s) return;
  s.delete(ws);
  if (s.size === 0) clientsByUser.delete(userId);
}

app.get('/ws', async (c) => {
  console.log('ws: connection attempt');
  const req = c.req.raw;

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

  // Validate token with Supabase
  let userId: string;
  let userEmail: string;
  try {
    console.log('ws: validating token...', token);
    const { data: userData, error } = await supabase.auth.getUser(token);
    if (error || !userData?.user) {
      console.error('ws: token validation failed:', error);
      return c.text('Invalid or expired token', 401);
    }
    userId = userData.user.id;
    userEmail = userData.user.email || 'unknown';
    console.log('ws: user authenticated:', { userId, email: userEmail });
  } catch (err) {
    console.error('ws: authentication error:', err);
    return c.text('Authentication failed', 401);
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
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

    addClient(userId, socket);

    // Send authentication success message
    try {
      socket.send(JSON.stringify({
        type: 'connected',
        userId,
        email: userEmail,
        message: 'Successfully authenticated and connected',
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('ws: error sending welcome message:', error);
    }
  };

  socket.onmessage = (ev) => {
    try {
      if (typeof ev.data === 'string') {
        const msg = JSON.parse(ev.data);
        console.log('ws: message from user', { userId, msgType: msg.type });

        // Handle different message types
        switch (msg.type) {
          case 'ping':
            try {
              socket.send(JSON.stringify({
                type: 'pong',
                timestamp: Date.now(),
                serverTime: new Date().toISOString()
              }));
            } catch (error) {
              console.error('ws: error sending pong:', error);
            }
            break;

          case 'subscribe_event':
            handleEventSubscription(userId, msg.eventId, socket);
            break;

          default:
            console.log('ws: unhandled message type:', msg.type);
        }
      }
    } catch (error) {
      console.warn('ws: invalid message from user', { userId, error });
      try {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      } catch (sendError) {
        console.error('ws: error sending error message:', sendError);
      }
    }
  };

  socket.onclose = (event) => {
    console.log('ws: connection closed for user:', {
      userId,
      code: event.code,
      reason: event.reason
    });
    removeClient(userId, socket);
  };

  socket.onerror = (error) => {
    console.error('ws: socket error for user:', { userId, error });
  };

  return response;
});

// Handle event subscription with permission checks
async function handleEventSubscription(userId: string, eventId: string, socket: DenoteWebSocket) {
  try {
    console.log('ws: handling event subscription:', { userId, eventId });

    if (!eventId) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Event ID is required for subscription'
      }));
      return;
    }

    // Check if event exists and user has permission
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, owner_id, is_private')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.log('ws: event not found:', { eventId, error: eventError });
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Event not found'
      }));
      return;
    }

    // Check if user is owner
    const isOwner = event.owner_id === userId;

    // Check if user is a member
    const { data: membership } = await supabase
      .from('event_members')
      .select('profile_id')
      .eq('event_id', eventId)
      .eq('profile_id', userId)
      .single();

    const isMember = !!membership;

    // For private events, user must be owner or member
    if (event.is_private && !isOwner && !isMember) {
      console.log('ws: access denied to private event:', { userId, eventId });
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Access denied: You are not authorized to access this private event'
      }));
      return;
    }

    // Subscription successful
    console.log('ws: event subscription successful:', {
      userId,
      eventId,
      eventName: event.name,
      isOwner,
      isMember
    });

    socket.send(JSON.stringify({
      type: 'subscribed',
      eventId,
      eventName: event.name,
      role: isOwner ? 'owner' : (isMember ? 'member' : 'public'),
      message: `Successfully subscribed to event: ${event.name}`,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('ws: event subscription error:', { userId, eventId, error });
    try {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process event subscription'
      }));
    } catch (sendError) {
      console.error('ws: error sending subscription error:', sendError);
    }
  }
}

async function startRealtime() {
  const eventsChannel = supabase.channel('realtime-events');
  eventsChannel.on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, async (payload: any) => {
    try {
      const ev = payload.new ?? payload.old;
      const eventId = ev?.id;
      if (!eventId) return;

      const ownerId = ev?.owner_id;
      const { data: members } = await supabase.from('event_members').select('profile_id').eq('event_id', eventId);

      const recipients = new Set<string>();
      if (ownerId) recipients.add(ownerId);
      for (const m of members ?? []) if (m.profile_id) recipients.add(m.profile_id);

      const message = JSON.stringify({
        type: 'event:changed',
        op: payload.eventType,
        eventId,
        payload: ev,
        timestamp: new Date().toISOString()
      });

      console.log('ws: broadcasting event change to', recipients.size, 'users');

      for (const uid of recipients) {
        const userSockets = clientsByUser.get(uid);
        if (!userSockets) continue;
        for (const socket of userSockets) {
          try {
            socket.send(message);
          } catch (error) {
            console.error('ws: error sending event update:', error);
          }
        }
      }
    } catch (err) {
      console.warn('realtime events handler error', err);
    }
  });

  const membersChannel = supabase.channel('realtime-event-members');
  membersChannel.on('postgres_changes', { event: '*', schema: 'public', table: 'event_members' }, async (payload: any) => {
    try {
      const row = payload.new ?? payload.old;
      if (!row) return;
      const userId = row.profile_id;
      const eventId = row.event_id;
      const { data: ev } = await supabase.from('events').select('id, name, owner_id').eq('id', eventId).single();
      const recipients = new Set<string>();
      if (userId) recipients.add(userId);
      if (ev?.owner_id) recipients.add(ev.owner_id);

      const message = JSON.stringify({
        type: 'event_members:changed',
        op: payload.eventType,
        eventId,
        eventName: ev?.name,
        payload: row,
        timestamp: new Date().toISOString()
      });

      console.log('ws: broadcasting member change to', recipients.size, 'users');

      for (const uid of recipients) {
        const userSockets = clientsByUser.get(uid);
        if (!userSockets) continue;
        for (const socket of userSockets) {
          try {
            socket.send(message);
          } catch (error) {
            console.error('ws: error sending member update:', error);
          }
        }
      }
    } catch (err) {
      console.warn('realtime event_members handler error', err);
    }
  });

  await eventsChannel.subscribe();
  await membersChannel.subscribe();
  console.log('✅ Realtime subscriptions started for events and event_members');
}

startRealtime().catch(console.error);

console.log('🚀 Hono WS server (Deno) listening on port', PORT);

serve(app.fetch, { port: PORT });
