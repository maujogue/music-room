import { Hono } from 'hono';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
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
  // Upgrade the request to a WebSocket
  console.log('ws connection attempt');
  const req = c.req.raw;
  if (!req.headers.get('upgrade') || req.headers.get('upgrade')!.toLowerCase() !== 'websocket') {
    return c.text('expected websocket', 400);
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) {
      try { socket.close(1008, 'Missing token'); } catch (_) {}
      return response;
    }

    const { data: userData, error } = await supabase.auth.getUser(token);
    if (error || !userData?.user) {
      try { socket.close(1008, 'Invalid token'); } catch (_) {}
      return response;
    }
    const userId = userData.user.id;

    addClient(userId, socket);

    socket.onmessage = (ev) => {
      // handle inbound messages if needed
      try {
        if (typeof ev.data === 'string') {
          const msg = JSON.parse(ev.data);
          // implement custom message handling if required
        }
      } catch (_) {}
    };

    socket.onclose = () => removeClient(userId, socket);
    socket.onerror = (e) => console.error('socket error', e);

    try { socket.send(JSON.stringify({ type: 'connected', userId })); } catch (_) {}
  } catch (err) {
    console.error('ws connection error', err);
    try { socket.close(1011, 'Server error'); } catch (_) {}
  }

  return response;
});

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

      const message = JSON.stringify({ type: 'event:changed', op: payload.eventType, eventId, payload: ev });

      for (const uid of recipients) {
        const conns = clientsByUser.get(uid);
        if (!conns) continue;
        for (const c of conns) {
          try { c.send(message); } catch (_) {}
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
      const { data: ev } = await supabase.from('events').select('id, owner_id').eq('id', eventId).single();
      const recipients = new Set<string>();
      if (userId) recipients.add(userId);
      if (ev?.owner_id) recipients.add(ev.owner_id);

      const message = JSON.stringify({ type: 'event_members:changed', op: payload.eventType, eventId, payload: row });

      for (const uid of recipients) {
        const conns = clientsByUser.get(uid);
        if (!conns) continue;
        for (const c of conns) {
          try { c.send(message); } catch (_) {}
        }
      }
    } catch (err) {
      console.warn('realtime event_members handler error', err);
    }
  });

  await eventsChannel.subscribe();
  await membersChannel.subscribe();
  console.log('Realtime subscriptions started');
}

startRealtime().catch(console.error);

console.log('Hono WS server (Deno) listening on port', PORT);

serve(app.fetch, { port: PORT });
