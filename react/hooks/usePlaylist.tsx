import { useCallback, useEffect, useState } from 'react';
import { getErrorMsg } from '@/utils/getErrorMsg';
import { getPlaylistById, deletePlaylistById } from '@/services/playlist';

// -------------------------------------------------------------------
// Hook for new playlist system
// -------------------------------------------------------------------

export function usePlaylist(id: string | null) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------
  // Fetch playlist (GET)
  // ---------------------------------------------------------------
  const fetchPlaylist = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPlaylistById(id);
      setPlaylist(data);
    } catch (err) {
      console.error('Fetch playlist error:', err);
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

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
      await deletePlaylistById(id);
      setPlaylist(null);
    } catch (e: any) {
      setError(`delete playlist error: ${e.message ?? e}`);
      console.error('Delete playlist error:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { playlist, loading, error, refetch, deletePlaylist };
}
