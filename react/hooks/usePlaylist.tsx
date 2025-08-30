import { useEffect, useState } from 'react';
import { MOCK_PLAYLISTS } from '@/mocks/mockPlaylists';
import { SpotifyPlaylist } from '@/types/spotify';
import { getSession } from '../services/session';

// -------------------------------------------------------------------
// Hook with mock-datas (TODO : connect fetch backend when ready)
// -------------------------------------------------------------------
export function usePlaylist(id: string) {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('usePlaylist called with id:', id);

  if (!id) {
    console.log('usePlaylist called WITHOUT id:');
    setError("NO ID PLAYLIST")
  }

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);

    const fetchPlaylistItems = async (session: any) => {
      try {
        // TODO : NOT READY TO USE ON BACKEND ATM : DELETE OR CHANGE THIS HOOK
        return fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          },
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        });
      } catch (e) {
        if (isActive) {
          setError(`fetch playlists error: ${e}`);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };


  getSession().then((res) => {
    fetchPlaylistItems(res).then((data) => {
      if (isActive) {
        console.log("******** ========== usePlaylist DATA ========= ***************")
        console.log(data)
        setPlaylist(data || null);
      }
    });
  }).catch((err) => {
    console.error('Error in useUserPlaylists:', err)
  });

  return () => {
    isActive = false;
  };
  }, []);

  return { playlist, loading, error };
};
