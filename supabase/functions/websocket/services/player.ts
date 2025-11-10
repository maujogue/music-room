import { createClient } from '@supabase/supabase-js';
import type { SpotifyCurrentlyPlayingTrack } from '@track';
import { getCurrentUserPlayingTrack } from '@me/services/spotify';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function getOwnerCurrentPlayingTrack(
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
    if ((spotifyResp as unknown) instanceof Response) {
      const r = spotifyResp as Response;
      if (r.status === 204) return {
        data: null,
        error: null,
      };
      try {
        const json = await r.json();
        return {
          data: json as SpotifyCurrentlyPlayingTrack,
          error: null,
        };
      } catch (err) {
        return {
          data: null,
          error: {
            status: 500,
            message: 'Failed to parse Spotify response',
          }
        };
      }
    }

    return {
      data: spotifyResp as SpotifyCurrentlyPlayingTrack,
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
