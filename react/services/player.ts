import { apiFetch } from '@/utils/apiFetch';

export async function getCurrentUserCurrentlyPlayingTrack() {
  const res = await apiFetch<SpotifyCurrentlyPlayingTrack>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/player/currently-playing`,
    {
      method: 'GET',
    }
  );
  if (!res.success) {
    console.error('Error fetching currently playing track:', res.error);
    throw res.error;
  }
  // console.log('Currently playing track:', res.data);
  return res.data;
}

export async function playTrack(uris?: string[]) {
  if (uris) {
    uris = uris.map(uri => uri.startsWith('spotify:track:') ? uri : `spotify:track:${uri}`);
  }
  const res = await apiFetch<void>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/player/play`,
    {
      method: 'PUT',
      body: { uris },
    }
  );
  if (!res.success) {
    console.error('Error playing track:', res.error);
    throw res.error;
  }
  console.log('Track played successfully');
}

export async function pauseTrack() {
  const res = await apiFetch<void>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/player/pause`,
    {
      method: 'PUT',
    }
  );
  if (!res.success) {
    console.error('Error pausing track:', res.error);
    throw res.error;
  }
  console.log('Track paused successfully');
}

export async function skipToNextTrack() {
  const res = await apiFetch<void>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/player/next`,
    {
      method: 'POST',
    }
  );
  if (!res.success) {
    console.error('Error skipping to next track:', res.error);
    throw res.error;
  }
  console.log('Skipped to next track successfully');
}
