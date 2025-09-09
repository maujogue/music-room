import { useCallback, useEffect, useState } from 'react';
import { getErrorMsg } from '@/utils/getErrorMsg';
import { getPlaylistById } from '@/services/playlist';

// -------------------------------------------------------------------
// Hook with mock-datas (TODO : connect fetch backend when ready)
// -------------------------------------------------------------------

export function usePlaylist(id: string) {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
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
      // await deletePlaylistService(id);
      // setPlaylist(null);
      console.log("Delete playlist service not implemented. Remove this button ?")
    } catch (e: any) {
      setError(`delete playlist error: ${e.message ?? e}`);
      console.error('Delete playlist error:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);


  return { playlist, loading, error, refetch, deletePlaylist };
};
