import { Context } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
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
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import getPublicUrlForPath from '../../utils/get_public_url_for_path.tsx'

const supabase = createClient(
  Deno.env.get('EXPO_PUBLIC_SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function fetchCurrentUserPlaylists(c: Context): Promise<Response> {
    const user = c.get('user')
    const res = await getCurrentUserPlaylistSupabase(user.id)

    console.log('Playlists fetched from Supabase:', res);
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
    const body = await c.req.json()
    const res = await startPlayback(spotify_token, body)

    if (!res) {
      c.status(500)
      return c.json({ error: 'Failed to start Spotify playback' })
    }

    console.log('Response from startPlayback:', res);
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

export async function fetchCurrentUserEvents(c: Context): Promise<any> {
  const user = c.get('user')

  const events = await getSupabaseEventByOwner(user.id)
  if (!events) {
    throw new HTTPException(500, { message: 'Failed to fetch events' })
  }
  console.log('Events fetched from Supabase:', events);
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

export async function syncSpotifyPlaylists(c: Context): Promise<any> {
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
