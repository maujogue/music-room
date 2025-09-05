import { useCallback, useEffect, useState } from 'react';
import { SpotifyPlaylist } from '@/types/spotify';
import { getSession } from '@/services/session';
import { getCurrentUserPlaylists } from '@/services/playlist';

export function useUserPlaylists() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) throw new Error('Session retrieve error');
      const data = await getCurrentUserPlaylists();
      setPlaylists(data.items || []);
      for (const playlist of data.items) {
        console.log(`PLAYLIST ID [${playlist.id}]`)
        console.log(`PLAYLIST NAME [${playlist.name}] | PUBLIC [${playlist.public}] | COLLABORATIVE [${playlist.collaborative}]`)
      }
      // --------------------------------
    } catch (e) {
      console.error('Error fetching playlists:', e);
      setError('fetch playlists error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return { playlists, refetch, loading, error };
};


