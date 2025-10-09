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
                serverTime: new Date().toISOString(),
                email: userEmail
              }));
            } catch (error) {
              console.error('ws: error sending pong:', error);
            }
            break;

          case 'vote':
            handleVote(userId, msg, socket);
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

// Handle vote from client
async function handleVote(userId: string, msg: any, socket: DenoteWebSocket) {
  try {
    const { eventId, trackId } = msg;

    if (!eventId || !trackId) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Missing required vote parameters (eventId, trackId, vote)'
      }));
      return;
    }

    console.log('ws: processing vote', { userId, eventId, trackId });

    // Vérifier les permissions de l'utilisateur pour cet événement
    const { data: event } = await supabase
      .from('events')
      .select('owner_id, everyone_can_vote, name')
      .eq('id', eventId)
      .single();

    if (!event) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Event not found'
      }));
      return;
    }

    // Vérifier si l'utilisateur peut voter
    const isOwner = event.owner_id === userId;
    let isMember = false;

    if (!isOwner) {
      const { data: membership } = await supabase
        .from('event_members')
        .select('profile_id')
        .eq('event_id', eventId)
        .eq('profile_id', userId)
        .single();
      isMember = !!membership;
    }

    const canVote = isOwner || isMember || event.everyone_can_vote;

    if (!canVote) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'You do not have permission to vote in this event'
      }));
      return;
    }
    
    const { data: existingVote, error: fetchError } = await supabase
      .from('track_votes')
      .select('voters, vote_count')
      .eq('event_id', eventId)
      .eq('track_id', trackId)
      .single();

    let voters: string[] = [];
    let voteCount = 0;
    if (existingVote) {
      if (Array.isArray(existingVote.voters)) {
        voters = existingVote.voters;
      }
      voteCount = existingVote.vote_count;
    }

    if (!voters.includes(userId)) {
      voters.push(userId);
    }
    voteCount += 1;

    const { error: upsertError } = await supabase.from('track_votes').upsert({
      event_id: eventId,
      track_id: trackId,
      voters,
      vote_count: voteCount,
    }, { onConflict: 'event_id,track_id' });

    if (upsertError) {
      console.error('Vote save error:', upsertError);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to save vote'
      }));
      return;
    }

    // Confirmer le vote à l'utilisateur
    socket.send(JSON.stringify({
      type: 'vote:confirmed',
      eventId,
      trackId,
      message: `Your vote has been recorded for track ${trackId}`
    }));

    console.log(`✅ Vote processed: ${userId} voted for track ${trackId} in event ${eventId}`);

  } catch (error) {
    console.error('Vote handling error:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Internal server error while processing vote'
    }));
  }
}

async function startVoteRealtime() {
  const trackVotesChannel = supabase.channel('realtime-track-votes');
  trackVotesChannel.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'track_votes'
  }, async (payload: any) => {
    try {
      const trackVote = payload.new ?? payload.old;
      if (!trackVote) return;

      const eventId = trackVote.event_id;
      const trackId = trackVote.track_id;
      const voteCount = trackVote.vote_count;
      const voters = trackVote.voters || [];

      // Récupérer les participants à notifier
      const { data: event } = await supabase
        .from('events')
        .select('owner_id, name')
        .eq('id', eventId)
        .single();

      const { data: members } = await supabase
        .from('event_members')
        .select('profile_id')
        .eq('event_id', eventId);

      const recipients = new Set<string>();
      if (event?.owner_id) recipients.add(event.owner_id);
      for (const m of members ?? []) if (m.profile_id) recipients.add(m.profile_id);

      const message = JSON.stringify({
        type: 'track_vote:update',
        op: payload.eventType,
        eventId,
        eventName: event?.name,
        trackId,
        voteCount,
        voters,
        timestamp: new Date().toISOString()
      });

      console.log(`📡 Broadcasting track vote update for ${trackId} (${voteCount} votes) to ${recipients.size} users`);

      // Diffuser à tous les participants
      for (const uid of recipients) {
        const userSockets = clientsByUser.get(uid);
        if (!userSockets) continue;
        for (const socket of userSockets) {
          try {
            socket.send(message);
          } catch (error) {
            console.error('Error sending track vote update:', error);
          }
        }
      }
    } catch (err) {
      console.warn('realtime track votes handler error', err);
    }
  });

  await trackVotesChannel.subscribe();
  console.log('✅ Realtime track votes subscription started');
}

// Start only vote realtime subscriptions
startVoteRealtime().catch(console.error);

console.log('🚀 Hono WS server (Deno) listening on port', PORT);

serve(app.fetch, { port: PORT });
