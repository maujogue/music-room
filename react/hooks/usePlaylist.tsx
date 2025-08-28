import { useEffect, useState } from 'react';
import { MOCK_PLAYLISTS } from '@/mocks/mockPlaylists';
import { SpotifyPlaylist } from '@/types/spotify';

// -------------------------------------------------------------------
// Hook with mock-datas (TODO : connect fetch backend when ready)
// -------------------------------------------------------------------
export function usePlaylist(id: string) {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);

    const fetchPlaylist = async () => {
      try {
        // MOCK_PLAYLISTS (use fetch when ready)
        await new Promise(resolve => setTimeout(resolve, 800));
        if (isActive) {
          const filtered = MOCK_PLAYLISTS.find((p) => p.id === id);
          const defaultPlaylist = MOCK_PLAYLISTS[0] || null;

          setPlaylist(filtered || defaultPlaylist);
        }
      } catch (e) {
        if (isActive) {
          setError('fetch playlists error');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchPlaylist();
    return () => {
      isActive = false;
    };
  }, []);

  return { playlist, loading, error };
};
