import { useQuery } from '@tanstack/react-query';
import { getEventsWithRadar } from '@/services/events';
import { getErrorMsg } from '@/utils/getErrorMsg';

export function useEventsRadar(coords: Coordinates | null) {
  const {
    data: events,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['radar-events', coords],
    queryFn: () => getEventsWithRadar(coords!),
    enabled: !!coords,
  });

  return {
    events: events ?? [],
    launchRadar: refetch,
    loading,
    error: error ? getErrorMsg(error) : null,
  };
}
