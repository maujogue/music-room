import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/apiFetch';

export default function useTracks(ids: string[]) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ids || ids.length === 0) {
      setTracks([]);
      return;
    }

    const fetchTracks = async () => {
      setLoading(true);
      setError(null);
      try {
        const idsParam = encodeURIComponent(ids.join(','));
        const res = await apiFetch<any>(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/tracks?ids=${idsParam}`
        );

        if (res.success && res.data?.tracks) {
          setTracks(res.data.tracks);
        } else if (!res.success) {
          const errorMsg =
            (res as any).error?.message || 'Failed to fetch tracks';
          console.error('Failed to fetch tracks', (res as any).error);
          setError(errorMsg);
        }
      } catch (err) {
        console.error('Error in useTracks:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [ids.join(',')]); // Depend on the IDs string representation

  return { tracks, loading, error };
}
