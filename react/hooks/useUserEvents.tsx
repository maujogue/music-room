import { useQuery } from '@tanstack/react-query';
import { getSession } from '@/services/session';
import { getCurrentUserEvents } from '@/services/events';
import { getErrorMsg } from '@/utils/getErrorMsg';

export function useUserEvents() {
  const {
    data: events,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-events'],
    queryFn: async () => {
      const session = await getSession();
      if (!session) throw new Error('Session retrieve error');
      return getCurrentUserEvents();
    },
    refetchInterval: 60000, // Background poll every 1 minute
  });

  return {
    events: events ?? null,
    refetch,
    loading,
    error: error ? getErrorMsg(error) : null,
  };
}
