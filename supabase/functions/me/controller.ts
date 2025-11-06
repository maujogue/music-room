import { Context } from '@hono/hono'
import { HTTPException } from '@hono/http-exception'
import {
  getCurrentUserPlaylists,
  getCurrentUserPlayingTrack,
  startPlayback,
  pausePlayback,
  skipToNextTrack
} from './services/spotify.ts'
import {
  getSupabaseEventByOwner,
  getCurrentUserPlaylistSupabase
} from './services/supabase.ts'
import { createClient } from '@supabase/supabase-js';
import getPublicUrlForPath from '../../utils/get_public_url_for_path.tsx'
import { getUserProfile } from '@profile/service';
import { getUserSubscription } from './services/supabase.ts';
import type { ProfileResponse } from '@profile';
import { safeJsonFromContext } from '@utils/parsing';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function fetchCurrentUserProfile(c: Context): Promise<Response> {
    const user = c.get('user')
    const res: ProfileResponse | null = await getUserProfile(user.id)

    if (!res) {
      c.status(404);
      return c.json({ error: 'User profile not found' });
    }

    c.status(200);
    return c.json(res);
}

export async function fetchCurrentUserPlaylists(c: Context): Promise<Response> {
    const user = c.get('user')
    const res = await getCurrentUserPlaylistSupabase(user.id)

    c.status(200)
    return c.json(res)
}

export async function fetchCurrentUserPlayingTrack(c: Context): Promise<Response> {
    const spotify_token = c.get('spotify_token')
    const res = await getCurrentUserPlayingTrack(spotify_token)

    if (!res) {
      throw new HTTPException(500, { message: 'Failed to fetch Spotify currently playing track' })
    }

    if (res.error) {
      c .status(res.error.status || 500)
      return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
    }

    if (res.status === 204) {
      c.status(204)
      return c.body(null)
    }

    c.status(200)
    return c.json(res)
}

export async function startUserPlayback(c: Context): Promise<Response> {
    const spotify_token = c.get('spotify_token')
    const body = await safeJsonFromContext(c)
    const res = await startPlayback(spotify_token, body)

    if (!res) {
      c.status(500)
      return c.json({ error: 'Failed to start Spotify playback' })
    }

    if (res.error || !res.ok) {
      console.error('Error from Spotify API:', res.error);
      if (res.error) {
        c.status(res.status || 500)
        return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
      }
      c.status(res.status || 500)
      return c.json({ error: res.statusText || 'Unknown error from Spotify API' })
    }

    c.status(204)
    return c.body(null)
}

export async function pauseUserPlayback(c: Context): Promise<Response> {
    const spotify_token = c.get('spotify_token')
    const res = await pausePlayback(spotify_token)

    if (!res) {
      c.status(500)
      return c.json({ error: 'Failed to pause Spotify playback' })
    }
    if (res.error) {
      c .status(res.error.status || 500)
      return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
    }

    c.status(200)
    return c.json(res)
}

export async function skipToNextUserTrack(c: Context): Promise<Response> {
    const spotify_token = c.get('spotify_token')
    const res = await skipToNextTrack(spotify_token)

    if (!res) {
      c.status(500)
      return c.json({ error: 'Failed to skip to next Spotify track' })
    }
    if (res.error || !res.ok) {
      console.error('Error from Spotify API:', res.error);
      if (res.error) {
        c.status(res.status || 500)
        return c.json({ error: res.error.message || 'Unknown error from Spotify API' })
      }
      c.status(res.status || 500)
      return c.json({ error: res.statusText || 'Unknown error from Spotify API' })
    }

    c.status(204);
    return c.body(null);
}

export async function fetchCurrentUserEvents(c: Context): Promise<Response> {
  const user = c.get('user')

  const events = await getSupabaseEventByOwner(user.id)
  if (!events) {
    throw new HTTPException(500, { message: 'Failed to fetch events' })
  }
  for (const data of events) {
    try {
      const imagePath = data.event.image_url;
      if (imagePath) {
        const publicUrl = await getPublicUrlForPath(imagePath);
        console.log('Resolved public URL for image:', publicUrl);
        data.event.image_url = publicUrl;
      }
    } catch (error) {
      console.error('Error fetching public URL for image:', error);
    }
  }

  return c.json(events)
}

export async function syncSpotifyPlaylists(c: Context): Promise<Response> {
  const user = c.get('user')
  const spotify_token = c.get('spotify_token')

  const playlists = await getCurrentUserPlaylists(spotify_token)
  if (!playlists) {
    throw new HTTPException(500, { message: 'Failed to fetch Spotify playlists' })
  }
  if (playlists.error) {
    c.status(playlists.error.status || 500)
    return c.json({ error: playlists.error.message || 'Unknown error from Spotify API' })
  }

  const now = new Date().toISOString()
  const playlistsPayload: any[] = playlists.items.map((p: any) => ({
    name: p.name,
    description: p.description,
    owner_id: user.id,
    cover_url: p.images && p.images.length > 0 ? p.images[0].url : null,
    is_collaborative: p.collaborative,
    is_spotify_sync: true,
    spotify_id: p.id,
    updated_at: now
  }))

  if (playlistsPayload.length > 0) {
    const { error, data } = await supabase
      .from('playlists')
      .upsert(playlistsPayload, { onConflict: 'spotify_id' })
      .select()

    if (error) {
      console.error('Error upserting playlists into Supabase:', error)
      throw new HTTPException(500, { message: 'Failed to upsert playlists into Supabase' })
    }

    c.status(200)
    return c.json({
      message: 'Playlists synchronized successfully (upsert)',
      syncedCount: playlistsPayload.length,
      returnedRows: Array.isArray(data) ? data.length : 0
    })
  }

  c.status(200)
  return c.json({ message: 'No playlists to synchronize', syncedCount: 0 })
}

export async function getMySubscription(c: Context): Promise<Response> {
  const user = c.get('user');
  
  try {
    const subscription = await getUserSubscription(user.id);
    
    c.status(200);
    return c.json(subscription); // Returns null for free users, subscription object for premium
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw new HTTPException(500, { message: 'Failed to fetch subscription' });
  }
}

export async function createMySubscription(c: Context): Promise<Response> {
  const user = c.get('user');
  
  try {
    // Check if user already has a subscription
    const existingSubscription = await getUserSubscription(user.id);
    if (existingSubscription) {
      c.status(400);
      return c.json({ error: 'User already has an active subscription' });
    }
    
    // Create new subscription with renewal date 30 days from now
    const now = new Date();
    const renewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        started_at: now.toISOString(),
        renewal_date: renewalDate.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subscription:', error);
      throw new HTTPException(500, { message: 'Failed to create subscription' });
    }
    
    c.status(201);
    return c.json(data);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error creating subscription:', error);
    throw new HTTPException(500, { message: 'Failed to create subscription' });
  }
}

export async function deleteMySubscription(c: Context): Promise<Response> {
  const user = c.get('user');
  
  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting subscription:', error);
      throw new HTTPException(500, { message: 'Failed to cancel subscription' });
    }
    
    c.status(200);
    return c.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error deleting subscription:', error);
    throw new HTTPException(500, { message: 'Failed to cancel subscription' });
  }
}
