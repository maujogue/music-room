import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authCtx';
import { getCurrentUserProfile } from '@/services/profile';
import { getCurrentUserEvents } from '@/services/events';
import { getCurrentUserPlaylists } from '@/services/playlist';

export function useCachePrewarmer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Prefetch Profile
    queryClient.prefetchQuery({
      queryKey: ['current-user-profile', user.id],
      queryFn: getCurrentUserProfile,
    });

    // Prefetch Events
    queryClient.prefetchQuery({
      queryKey: ['user-events'],
      queryFn: getCurrentUserEvents,
    });

    // Prefetch Playlists
    queryClient.prefetchQuery({
      queryKey: ['user-playlists'],
      queryFn: getCurrentUserPlaylists,
    });
  }, [user, queryClient]);
}
