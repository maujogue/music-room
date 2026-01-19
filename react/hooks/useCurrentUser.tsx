import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUserProfile } from '@/services/profile';
import { useAuth } from '@/contexts/authCtx';
import { supabase } from '@/services/supabase';
import { useEffect } from 'react';

export function useCurrentUser() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const queryKey = ['current-user-profile', user?.id];

    const {
        data: profile,
        isLoading: loading,
        error,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!user) return null;
            return getCurrentUserProfile();
        },
        enabled: !!user,
    });

    // Realtime subscription setup
    useEffect(() => {
        if (!user) return;

        const subscription = supabase
            .channel('public:profiles:' + user.id)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'follows',
                    filter: `follower_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'follows',
                    filter: `following_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user, queryClient, queryKey]);

    return {
        profile: profile ?? null,
        loading,
        error,
        refetch,
    };
}
