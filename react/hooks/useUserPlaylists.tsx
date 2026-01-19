import { useQuery } from '@tanstack/react-query';
import { getSession } from '@/services/session';
import { getCurrentUserPlaylists } from '@/services/playlist';
import { getErrorMsg } from '@/utils/getErrorMsg';

export function useUserPlaylists() {
  const {
    data: playlists,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-playlists'],
    queryFn: async () => {
      const session = await getSession();
      if (!session) throw new Error('Session retrieve error');
      return getCurrentUserPlaylists();
    },
    refetchInterval: 60000, // Background poll every 1 minute
  });

  return {
    playlists: playlists ?? null,
    refetch,
    loading,
    error: error ? getErrorMsg(error) : null
  };
}
