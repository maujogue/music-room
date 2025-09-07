import { apiFetch } from '@/utils/apiFetch';

export function getCurrentUserCurrentlyPlayingTrack() {
    const res = apiFetch<SpotifyCurrentlyPlayingTrack>(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/player/currently-playing`,
        {
            method: 'GET',
        }
    );
    console.log('API response:', res);
    if (!res.success) {
        console.error('Error fetching currently playing track:', res.error);
        throw res.error;
    }
    return res.data;
}
