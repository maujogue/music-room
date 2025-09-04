import { useCallback, useEffect, useState } from 'react';
import { SpotifyPlaylist } from '@/types/spotify';
import { getSession } from '@/services/session';
import { getErrorMsg } from '@/utils/getErrorMsg';
import { deletePlaylistService, getPlaylistById } from '@/services/playlist';

// -------------------------------------------------------------------
// Hook with mock-datas (TODO : connect fetch backend when ready)
// -------------------------------------------------------------------

export function usePlaylist(id: string) {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylist = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getPlaylistById(id);
      setPlaylist(data);
    } catch (err) {
      setError(getErrorMsg(err));
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

  // ---------------------------------------------------------------
  // Remove Playlist (DELETE)
  // ---------------------------------------------------------------
  const deletePlaylist = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await deletePlaylistService(id);
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
