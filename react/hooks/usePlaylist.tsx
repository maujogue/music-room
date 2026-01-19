import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMsg } from '@/utils/getErrorMsg';
import { getPlaylistById, deletePlaylistById } from '@/services/playlist';

// -------------------------------------------------------------------
// Hook for new playlist system
// -------------------------------------------------------------------

export function usePlaylist(id: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['playlist', id];

  // ---------------------------------------------------------------
  // Fetch playlist (GET)
  // ---------------------------------------------------------------
  const {
    data: playlist,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => (id ? getPlaylistById(id) : null),
    enabled: !!id,
  });

  // ---------------------------------------------------------------
  // Remove Playlist (DELETE)
  // ---------------------------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('No playlist ID');
      return deletePlaylistById(id);
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, null);
    },
  });

  const deletePlaylist = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync();
    } catch (e) {
      console.error('Delete playlist error:', e);
    }
  };

  const combinedError = error
    ? getErrorMsg(error)
    : deleteMutation.error
      ? getErrorMsg(deleteMutation.error)
      : null;

  return {
    playlist: playlist ?? null,
    loading: loading || deleteMutation.isPending,
    error: combinedError,
    refetch,
    deletePlaylist,
    canEdit: playlist?.user?.can_edit ?? false,
    canInvite: playlist?.user?.can_invite ?? false,
  };
}
