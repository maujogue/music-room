import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

export interface UserStats {
  playlists_count: number;
  events_participated: number;
  votes_cast: number;
  successful_votes: number;
  most_voted_tracks: {
    track_id: string;
    my_vote_count: number;
  }[];
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  successful_votes: number;
  total_votes: number;
  events_count: number;
}

export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_stats', {
        p_user_id: userId,
      });

      if (error) {
        throw error;
      }

      return data as UserStats;
    },
    enabled: !!userId,
  });
};

export const useFriendsLeaderboard = (userId: string) => {
  return useQuery({
    queryKey: ['friendsLeaderboard', userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_friends_leaderboard', {
        p_user_id: userId,
      });

      if (error) {
        throw error;
      }

      return data as LeaderboardEntry[];
    },
    enabled: !!userId,
  });
};
