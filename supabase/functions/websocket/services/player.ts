import { createClient } from '@supabase/supabase-js';
import type { SpotifyCurrentlyPlayingTrack } from '@/types/track';
import { getCurrentUserPlayingTrack } from '../../me/services/spotify.ts';
import { refreshSpotifyToken } from '../../auth/utils.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function getOwnerCurrentPlayingTrack(eventId?: string | undefined): Promise<SpotifyCurrentlyPlayingTrack | null> {
  try {
    if (!eventId) {
      console.log('player:getOwnerCurrentPlayingTrack missing eventId');
      return null;
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('owner_id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.log('player:getOwnerCurrentPlayingTrack event lookup failed', { eventId, eventError });
      return null;
    }
    const ownerId = event.owner_id as string | undefined;
    if (!ownerId) {
      console.log('player:getOwnerCurrentPlayingTrack no owner for event', { eventId });
      return null;
    }
    console.log('player:getOwnerCurrentPlayingTrack owner found', { eventId, ownerId });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('spotify_access_token, spotify_token_expires_at')
      .eq('id', ownerId)
      .single();

    if (profileError || !profile) {
      console.log('player:getOwnerCurrentPlayingTrack profile fetch failed', { ownerId, profileError });
      return null;
    }

    let accessToken = profile.spotify_access_token as string | null | undefined;
    const expiresAt = profile.spotify_token_expires_at ? new Date(profile.spotify_token_expires_at) : null;

    // Refresh token if missing or expired (small buffer)
    const now = Date.now();
    const bufferMs = 10_000;
    if (!accessToken || (expiresAt && expiresAt.getTime() < now + bufferMs)) {
      try {
        console.log('player:getOwnerCurrentPlayingTrack attempting token refresh', { ownerId });
        await refreshSpotifyToken(ownerId);
        const { data: refreshed } = await supabase
          .from('profiles')
          .select('spotify_access_token')
          .eq('id', ownerId)
          .single();
        if (refreshed && refreshed.spotify_access_token) {
          accessToken = refreshed.spotify_access_token;
          console.log('player:getOwnerCurrentPlayingTrack token refreshed', { ownerId });
        } else {
          console.log('player:getOwnerCurrentPlayingTrack token refresh returned no token', { ownerId, refreshed });
        }
      } catch (err) {
        console.warn('player:getOwnerCurrentPlayingTrack refresh failed', { ownerId, err });
      }
    }

    if (!accessToken) {
      console.log('player:getOwnerCurrentPlayingTrack no access token available', { ownerId });
      return null;
    }
    console.log('player:getOwnerCurrentPlayingTrack calling spotify API', { ownerId });

    const spotifyResp = await getCurrentUserPlayingTrack(accessToken);
    // normalize 204 / empty responses
    if (!spotifyResp) {
      console.log('player:getOwnerCurrentPlayingTrack spotify returned empty', { ownerId });
      return null;
    }
    if ((spotifyResp as unknown) instanceof Response) {
      const r = spotifyResp as Response;
      console.log('player:getOwnerCurrentPlayingTrack spotify raw Response', { ownerId, status: r.status });
      if (r.status === 204) return null;
      try {
        const json = await r.json();
        console.log('player:getOwnerCurrentPlayingTrack spotify json received', { ownerId });
        return json as SpotifyCurrentlyPlayingTrack;
      } catch (err) {
        console.warn('player:getOwnerCurrentPlayingTrack failed to parse spotify response', { ownerId, err });
        return null;
      }
    }

    console.log('player:getOwnerCurrentPlayingTrack returning spotify object', { ownerId });
    return spotifyResp as SpotifyCurrentlyPlayingTrack;
  } catch (error) {
    console.error('player:getOwnerCurrentPlayingTrack error:', error);
    return null;
  }
}
