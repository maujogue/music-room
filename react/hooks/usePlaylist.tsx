import { useCallback, useEffect, useState } from 'react';
import { SpotifyPlaylist } from '@/types/spotify';
import { getSession } from '../services/session';

// -------------------------------------------------------------------
// Hook with mock-datas (TODO : connect fetch backend when ready)
// -------------------------------------------------------------------
export function usePlaylist(id: string) {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!id) {
    setError("NO ID PLAYLIST")
  }

  // ---------------------------------------------------------------
  // Fetch playlist (GET)
  // ---------------------------------------------------------------
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
        setPlaylist(data || null);
      }
    });
  }).catch((err) => {
    console.error('Error in useUserPlaylists:', err)
  });

  return () => {
    isActive = false;
  };
  }, [id]);


  // ---------------------------------------------------------------
  // Remove Playlist (DELETE)
  // ---------------------------------------------------------------
  const deletePlaylist = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const session = await getSession();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Delete failed (status ${response.status}): ${errorBody}`,
        );
      }
      setPlaylist(null);
    } catch (e: any) {
      setError(`delete playlist error: ${e.message ?? e}`);
      console.error('Delete playlist error:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);


  return { playlist, loading, error, deletePlaylist };
};
