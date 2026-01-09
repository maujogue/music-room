import { createClient } from '@supabase/supabase-js';
import type { SpotifyCurrentlyPlayingTrack } from '@track';
import { getCurrentUserPlayingTrack } from '@me/services/spotify';
import { getEventSupabase } from './events.ts';
import { clearTrackVotes } from './votes.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Helper: get current top track for an event (track_id) or null
async function getTopTrackForEvent(eventId: string): Promise<{ trackId: string | null; voteCount: number | null }> {
  try {
    const { data, error } = await supabase
      .from('track_votes')
      .select('track_id, vote_count')
      .eq('event_id', eventId)
      .order('vote_count', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching top track (player):', error);
      return { trackId: null, voteCount: null };
    }
    if (!data || !Array.isArray(data) || data.length === 0) return { trackId: null, voteCount: null };
    const top = data[0] as { track_id: string; vote_count: number };
    return { trackId: top.track_id ?? null, voteCount: top.vote_count ?? null };
  } catch (err) {
    console.error('Exception getting top track (player):', err);
    return { trackId: null, voteCount: null };
  }
}

export async function addItemToSpotifyOwnerQueue(item: string, spotify_token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/queue?uri=' + encodeURIComponent(item), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${spotify_token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      console.error('Failed to add item to queue:', response);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error adding item to queue:', error);
    return false;
  }
}

export async function getOwnerCurrentPlayingTrack(
  userId: string,
  eventId?: string | undefined
): Promise<
  {
    data: SpotifyCurrentlyPlayingTrack | null;
    error: {
      status: number;
      message: string;
    } | null;
  }
> {
  try {
    if (!eventId) {
      return {
        data: null,
        error: {
          status: 400,
          message: 'Invalid event ID',
        }
      };
    }


    const { data, error } = await supabase.rpc('get_spotify_token_from_event_owner', {
      p_event_id: eventId
    });

    if (error || !data) {
      return {
        data: null,
        error: {
          status: 500,
          message: 'Failed to fetch owner Spotify token',
        }
      }
    }

    const accessToken = data[0].spotify_access_token as string | null | undefined;

    if (!accessToken) {
      return {
        data: null,
        error: {
          status: 404,
          message: 'Owner Spotify token not found',
        }
      }
    }

    const spotifyResp = await getCurrentUserPlayingTrack(accessToken);
    // normalize 204 / empty responses
    if (!spotifyResp) {
      return {
        data: null,
        error: {
          status: 404,
          message: '1 No active Spotify track found 1',
        }
      };
    }
    let current: SpotifyCurrentlyPlayingTrack | null = null;

    if ((spotifyResp as unknown) instanceof Response) {
      const r = spotifyResp as Response;
      if (r.status === 204) return {
        data: null,
        error: null,
      };
      try {
        const json = await r.json();
        current = json as SpotifyCurrentlyPlayingTrack;
      } catch (err) {
        return {
          data: null,
          error: {
            status: 500,
            message: 'Failed to parse Spotify response',
          }
        };
      }
    } else {
      current = spotifyResp as SpotifyCurrentlyPlayingTrack;
      await upsertEventCurrentTrack(eventId, current.item);
    }

    try {
      if (eventId && current && current.is_playing && typeof current.progress_ms === 'number' && current.item && typeof current.item.duration_ms === 'number') {
        const res = await supabase
          .from('event_current_track')
          .select('vote_resolved')
          .eq('event_id', eventId)
          .single();

        if (res.error) {
          console.warn('Error fetching vote_resolved status:', res.error);
        }
        if (res.data && !res.data.vote_resolved) {
          const voteResult = await resolveVoteCount(eventId, current, accessToken, userId);
          if (voteResult) {
            const { pushed, topId } = voteResult;
            // Leader push attempted; result handled inside resolveVoteCount
          }
        }
      }
    } catch (err) {
      console.warn('Error during leader push in getOwnerCurrentPlayingTrack:', err);
    }

    return {
      data: current,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        status: 500,
        message: 'Internal server error',
      }
    };
  }
}

async function resolveVoteCount(
  eventId: string,
  current: SpotifyCurrentlyPlayingTrack,
  accessToken: string,
  userId: string
): Promise<{ pushed: boolean; topId?: string } | null> {
  const event = await getEventSupabase(eventId);
  if (!event.success) {
    console.warn('Failed to fetch event for leader push:', event.message);
    return null;
  }

  if (event.data.owner_id !== userId) {
    console.warn('User is not event owner, cannot push to owner queue');
    return null;
  }

  const remainingMs = (current.item?.duration_ms ?? 0) - (current.progress_ms ?? 0);
  if (remainingMs > 5000) {
    return null;
  }

  const top = await getTopTrackForEvent(eventId);
  const topId = top.trackId;
  if (!topId) {
    return { pushed: false };
  }

  const currentTrackId = current.item?.id ?? null;
  if (currentTrackId === topId) {
    return { pushed: false, topId };
  }

  try {
    const pushed = await addItemToSpotifyOwnerQueue(topId, accessToken);
    await updateEventCurrentTrackVoteResolved(eventId, true);
    await clearTrackVotes(eventId, topId);
    return { pushed, topId };
  } catch (err) {
    console.warn('Failed to push top voted track to owner queue:', err);
    return { pushed: false, topId };
  }
}

async function upsertEventCurrentTrack(
  eventId: string,
  track: SpotifyTrack | null
): Promise<void> {
  try {
    const { error } = await supabase
      .from('event_current_track')
      .upsert({
        event_id: eventId,
        track_id: track?.id ?? null,
        title: track?.name ?? null,
        cover_url: track?.album?.images?.[0]?.url ?? null,
        artists_names: track?.artists.map(artist => artist.name) ?? []
      })
      .eq('event_id', eventId);
    if (error) {
      console.error('Error upserting event current track:', error);
    }
  } catch (err) {
    console.error('Exception upserting event current track:', err);
  }
}

async function updateEventCurrentTrackVoteResolved(
  eventId: string,
  voteResolved: boolean
): Promise<{ updatedAt: string | null }> {
  try {
    const updatedAt = new Date().toISOString();
    const { error } = await supabase
      .from('event_current_track')
      .update({ vote_resolved: voteResolved, updated_at: updatedAt })
      .eq('event_id', eventId);
    if (error) {
      console.error('Error updating event current track vote resolved:', error);
      return { updatedAt: null };
    }
    return { updatedAt };
  } catch (err) {
    console.error('Exception updating event current track vote resolved:', err);
    return { updatedAt: null };
  }
}