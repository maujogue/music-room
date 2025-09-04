import { useCallback, useEffect, useState } from 'react';
import { SpotifyPlaylist } from '@/types/spotify';
import { getSession } from '@/services/session';
import { getPlaylistById } from '@/services/playlist';

// -------------------------------------------------------------------
// Hook with mock-datas (TODO : connect fetch backend when ready)
// -------------------------------------------------------------------

export function usePlaylist(id: string) {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlaylist = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getPlaylistById(id);
      setPlaylist(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ---------------------------------------------------------------
  // Fetch playlist (GET)
  // ---------------------------------------------------------------
  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const refetch = useCallback(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);


  // getSession().then((res) => {
  //   fetchPlaylistItems(res).then((data) => {
  //     if (isActive) {
  //       setPlaylist(data || null);
  //     }
  //   });
  // }).catch((err) => {
  //   console.error('Error in useUserPlaylists:', err)
  // });

  // return () => {
  //   isActive = false;
  // };


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


  return { playlist, loading, error, refetch, deletePlaylist };
};
