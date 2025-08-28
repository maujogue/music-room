import { useEffect, useState } from 'react';
import { MOCK_PLAYLISTS } from '@/mocks/mockPlaylists';
import { SpotifyPlaylist } from '@/types/spotify';


// -------------------------------------------------------------------
// Hook with mock-datas (TODO : fetch backend when ready)
// -------------------------------------------------------------------
export function useUserPlaylists() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);

    const fetchPlaylists = async () => {
      try {
        // MOCK_PLAYLISTS (use fetch when ready)
        await new Promise(resolve => setTimeout(resolve, 800));
        if (isActive) {
          setPlaylists(MOCK_PLAYLISTS);
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

    fetchPlaylists();
    return () => {
      isActive = false;
    };
  }, []);

  return { playlists, loading, error };
};
