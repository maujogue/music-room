import { createClient } from '@supabase/supabase-js';
import { getEventSupabase } from './events.ts';
import { formatDbError } from '../../../utils/postgres_errors_map.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface TrackVoteRecord {
  event_id: string;
  track_id: string;
  vote_count: number;
  voters: string[];
}

interface RealtimePayload {
  eventType: string;
  new?: TrackVoteRecord;
  old?: TrackVoteRecord;
}

export interface VoteMessage {
  type: 'vote';
  eventId: string;
  trackId: string;
  [key: string]: unknown;
}

export interface Response {
  success: boolean;
  message: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  data?: {
    eventId: string;
    trackId: string;
    voteCount: number;
    voters: string[];
  };
}

// Handle vote from client
export async function handleVote(userId: string, msg: VoteMessage): Promise<VoteResponse> {
  try {
    const { eventId, trackId } = msg;

    if (!eventId || !trackId) {
      return {
        success: false,
        message: 'Missing required vote parameters (eventId, trackId)'
      };
    }

    console.log('ws: processing vote', { userId, eventId, trackId });

    const res = await getEventSupabase(eventId, 'owner_id, everyone_can_vote, name');

    if (!res.success) {
      return {
        success: false,
        message: res.message || 'Event not found'
      };
    }

    const resCanVote = await checkIfUserCanVote(eventId, userId);
    if (!resCanVote.success) {
      console.log('ws: user cannot vote:', { userId, eventId, reason: resCanVote.message });
      return {
        success: false,
        message: resCanVote.message || 'You do not have permission to vote in this event or have reached your vote limit'
      };
    }

    const voteRes = await getVote(eventId, trackId);
    if (!voteRes.success) {
      return {
        success: false,
        message: voteRes.message || 'Failed to fetch existing vote'
      };
    }
    const existingVote = voteRes.data;

    let voters: string[] = [];
    let voteCount = 0;
    if (existingVote) {
      if (Array.isArray(existingVote.voters)) {
        voters = existingVote.voters;
      }
      voteCount = existingVote.vote_count;
    }

    voters.push(userId);
    voteCount += 1;

    const upsertRes = await upsertVoteRecord(!existingVote ? {
      event_id: eventId,
      track_id: trackId,
      vote_count: 0,
      voters: []
    }: existingVote, voters, voteCount);

    if (!upsertRes.success) {
      return {
        success: false,
        message: upsertRes.message
      };
    }

    console.log(`✅ Vote processed: ${userId} voted for track ${trackId} in event ${eventId}`);

    return {
      success: true,
      message: `Your vote has been recorded for track ${trackId}`,
      data: {
        eventId,
        trackId,
        voteCount,
        voters
      }
    };

  } catch (error) {
    console.error('Vote handling error:', error);
    return {
      success: false,
      message: 'Internal server error while processing vote'
    };
  }
}

// Start realtime subscription for votes
export async function startVoteRealtime(clientsByUser: Map<string, Set<WebSocket>>) {
  const trackVotesChannel = supabase.channel('realtime-track-votes');

  trackVotesChannel.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'track_votes'
    // deno-lint-ignore no-explicit-any
  }, async (payload: any) => {
    try {
      const trackVote = payload.new ?? payload.old;
      if (!trackVote) {
        console.warn('⚠️ No trackVote data in payload');
        return;
      }

      const eventId = trackVote.event_id;
      const trackId = trackVote.track_id;
      const voteCount = trackVote.vote_count;
      const voters = trackVote.voters || [];

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

      let sentCount = 0;
      for (const uid of recipients) {
        const userSockets = clientsByUser.get(uid);
        if (!userSockets) {
          console.warn(`⚠️ No sockets found for user ${uid}`);
          continue;
        }
        console.log(`📤 Sending to user ${uid} (${userSockets.size} sockets)`);
        for (const socket of userSockets) {
          try {
            socket.send(message);
            sentCount++;
          } catch (error) {
            console.error(`❌ Error sending to user ${uid}:`, error);
          }
        }
      }
      console.log(`✅ Update sent to ${sentCount} socket connections`)
    } catch (err) {
      console.warn('realtime track votes handler error', err);
    }
  });

  await trackVotesChannel.subscribe();
  console.log('✅ Realtime track votes subscription started');
}

export async function handleUnvote(
  userId: string,
  trackId: string,
  eventId: string,
): Promise<VoteResponse> {
  try {
    const { data: existingVote, error: fetchError } = await supabase
      .from('track_votes')
      .select('*')
      .eq('event_id', eventId)
      .eq('track_id', trackId)
      .single();

    if (fetchError || !existingVote) {
      console.error('Unvote fetch error:', fetchError);
      return {
        success: false,
        message: 'Failed to fetch vote record'
      };
    }

    const votersArr = Array.isArray(existingVote.voters) ? [...existingVote.voters] : [];
    const idx = votersArr.indexOf(userId);
    if (idx !== -1) votersArr.splice(idx, 1);
    const updatedVoters = votersArr;
    const updatedVoteCount = Math.max(0, (existingVote.vote_count ?? 1) - 1);

    const res = await updateVoteRecord(existingVote, updatedVoters, updatedVoteCount);

    if (!res.success) {
      return {
        success: false,
        message: res.message
      };
    }

    const { voters, voteCount } = res;

    return {
      success: true,
      message: `Your unvote has been recorded for track ${trackId}`,
      data: {
        eventId,
        trackId,
        voteCount,
        voters
      }
    };

  } catch (error) {
    console.error('Unvote handling error:', error);
    return {
      success: false,
      message: 'Internal server error while processing unvote'
    };
  }
}

export async function getVotesForEvent(
  userId: string,
  eventId: string):
  Promise<{
    success: boolean;
    data?: TrackVoteRecord[];
    message?: string }> {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('owner_id, everyone_can_vote')
      .eq('id', eventId)
      .single();

    if (!event) {
      return { success: false, message: 'Event not found' };
    }

    const isOwner = event.owner_id === userId;
    let isMember = false;

    if (!isOwner) {
      const { data: membership, error: membershipError } = await supabase
        .from('event_members')
        .select('profile_id')
        .eq('event_id', eventId)
        .eq('profile_id', userId)
        .single();
      isMember = !!membership;

      if (membershipError) {
        console.error('Membership check error:', membershipError);
        return { success: false, message: 'Error checking event membership' };
      }
    }

    const { data: votes, error: votesError } = await supabase
      .from('track_votes')
      .select('*')
      .eq('event_id', eventId);

    if (votesError) {
      console.error('Votes fetch error:', votesError);
      return { success: false, message: 'Error fetching votes' };
    }

    if (votes) {
      return { success: true, data: votes };
    } else {
      return { success: true, data: [] };
    }

  } catch (error) {
    console.error('Error fetching votes:', error);
    return { success: false, message: 'Error fetching votes' };
  }
}

async function updateVoteRecord(vote: TrackVoteRecord, voters: string[], voteCount: number) {
  const { error: updateError } = await supabase
    .from('track_votes')
    .update({
      voters,
      vote_count: voteCount
    })
    .eq('event_id', vote.event_id)
    .eq('track_id', vote.track_id);

  if (updateError) {
    console.error('Unvote update error:', updateError);
    return {
      success: false,
      message: 'Failed to update vote record'
    };
  }
  return {
    success: true,
    voters,
    voteCount
  };
}

async function upsertVoteRecord(vote: TrackVoteRecord, voters: string[], voteCount: number) {
  const { error: upsertError } = await supabase.from('track_votes').upsert({
    event_id: vote.event_id,
    track_id: vote.track_id,
    voters,
    vote_count: voteCount,
  }, { onConflict: 'event_id,track_id' });

  if (upsertError) {
    console.error('Vote upsert error:', upsertError);
    const formattedError = formatDbError(upsertError);
    return {
      success: false,
      message: formattedError.message || 'Failed to upsert vote record'
    };
  }
  return {
    success: true,
    voters,
    voteCount
  };
}

async function checkIfUserCanVote(eventId: string, userId: string): Promise<Response> {
  const { data: canVoteResult, error: canVoteError } = await supabase
    .rpc('can_user_vote', {
      p_event_id: eventId,
      p_user_id: userId
    });

  if (canVoteError) {
    console.error('Error checking vote permission:', canVoteError);
    return {
      success: false,
      message: 'Error checking vote permission'
    };
  }

  if (!canVoteResult) {
    return {
      success: false,
      message: 'You do not have permission to vote in this event or have reached your vote limit'
    };
  }
  return { success: true, message: 'User can vote' };
}

async function getVote(eventId: string, trackId: string): Promise<{
  success: boolean;
  message?: string;
  data?: TrackVoteRecord
}> {
  const { data, error } = await supabase
    .from('track_votes')
    .select('*')
    .eq('event_id', eventId)
    .eq('track_id', trackId)
    .single();

  if (error) {
    if (!error.code || error.code === 'PGRST116') {
      return {
        success: true,
        data: null
      };
    }
    const formattedError = formatDbError(error);
    return {
      success: false,
      message: formattedError.message || 'Failed to fetch vote',
      data: null,
    };
  }
  return {
    success: true,
    data
  };
}
