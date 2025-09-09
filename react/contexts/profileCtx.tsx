import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { UserInfo } from '@/types/user';
import { supabase } from '@/services/supabase';
import { useAuth } from './authCtx';
import { getUserFollowers, getUserFollowing } from '@/services/follow';

interface ProfileContextType {
  profile: UserInfo | null;
  isLoading: boolean;
  followers: any[];
  following: any[];
  followersCount: number;
  followingCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile: (updates: Partial<UserInfo>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  refreshFollowingData: () => Promise<void>;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export function ProfileProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserInfo | null>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile and subscribe to realtime changes when user is authenticated
  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      if (!user) return;

      await refreshProfile();
      await refreshFollowingData();

      // Subscribe to realtime changes for this user's profile
      subscription = supabase
        .channel('public:profiles')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          () => {
            // On any change, refresh the profile
            refreshProfile();
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
            // On follow changes, refresh following data
            refreshFollowingData();
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
            // On follower changes, refresh following data
            refreshFollowingData();
          }
        )
        .subscribe();
    };

    if (user) {
      setupRealtime();
    } else {
      clearProfile();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  const refreshProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFollowingData = async () => {
    if (!user) return;

    try {
      const [followersResult, followingResult] = await Promise.all([
        getUserFollowers(user.id),
        getUserFollowing(user.id),
      ]);

      if (followersResult.error || followingResult.error) {
        console.error(
          'Error fetching following data:',
          followersResult.error || followingResult.error
        );
        setFollowers([]);
        setFollowing([]);
      } else {
        // Add follow status to followers (they follow the current user)
        const followersWithStatus = (followersResult.data || []).map(
          follower => ({
            ...follower,
            is_follower: true,
            is_following: false, // We don't follow them back yet
            is_friend: false,
          })
        );

        // Add follow status to following (we follow them)
        const followingWithStatus = (followingResult.data || []).map(
          followingUser => ({
            ...followingUser,
            is_follower: false, // They don't follow us back yet
            is_following: true,
            is_friend: false,
          })
        );

        setFollowers(followersWithStatus);
        setFollowing(followingWithStatus);
      }
    } catch (error) {
      console.error('Unexpected error fetching following data:', error);
      setFollowers([]);
      setFollowing([]);
    }
  };

  const updateProfile = async (
    updates: Partial<UserInfo>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ error: any }> => {
    if (!user || !profile) {
      return {
        error: { message: 'User not authenticated or profile not loaded' },
      };
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return { error };
      } else {
        // Update local state with new data
        setProfile(prev => (prev ? { ...prev, ...updates } : null));
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return { error: { message: 'An unexpected error occurred' } };
    } finally {
      setIsLoading(false);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setFollowers([]);
    setFollowing([]);
    setIsLoading(false);
  };

  const value: ProfileContextType = {
    profile,
    isLoading,
    followers,
    following,
    followersCount: followers.length,
    followingCount: following.length,
    updateProfile,
    refreshProfile,
    refreshFollowingData,
    clearProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
