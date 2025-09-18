import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from './authCtx';
import {
  getUserProfile,
  updateProfile as updateProfileAPI,
  followUser,
  unfollowUser,
  searchUsers,
} from '@/services/profile';

interface ProfileContextType {
  profile: UserInfo | null;
  isLoading: boolean;
  followers: any[];
  following: any[];
  followersCount: number;
  followingCount: number;
  updateProfile: (updates: Partial<UserInfo>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
  followUser: (userId: string) => Promise<{ error: any }>;
  unfollowUser: (userId: string) => Promise<{ error: any }>;
  searchUsers: (query: string) => Promise<{ data: any[]; error: any }>;
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
            refreshProfile();
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
            refreshProfile();
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
      const data = await getUserProfile('me');

      if (!data) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        setFollowers([]);
        setFollowing([]);
      } else {
        // The data now includes both profile and follow information
        setProfile(data?.profile || data);
        setFollowers(data?.followers || []);
        setFollowing(data?.following || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
      setFollowers([]);
      setFollowing([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    updates: Partial<UserInfo>
  ): Promise<{ error: any }> => {
    if (!user || !profile) {
      return {
        error: { message: 'User not authenticated or profile not loaded' },
      };
    }
    setIsLoading(true);
    try {
      const { error } = await updateProfileAPI(updates);

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

  const handleFollowUser = async (userId: string): Promise<{ error: any }> => {
    try {
      const { error } = await followUser(userId);
      if (!error) {
        // Refresh following data after successful follow
        await refreshProfile();
      }
      return { error };
    } catch (error) {
      console.error('Unexpected error following user:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const handleUnfollowUser = async (
    userId: string
  ): Promise<{ error: any }> => {
    try {
      const { error } = await unfollowUser(userId);
      if (!error) {
        // Refresh following data after successful unfollow
        await refreshProfile();
      }
      return { error };
    } catch (error) {
      console.error('Unexpected error unfollowing user:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const handleSearchUsers = async (
    query: string
  ): Promise<{ data: any[]; error: any }> => {
    try {
      return await searchUsers(query);
    } catch (error) {
      console.error('Unexpected error searching users:', error);
      return { data: [], error: { message: 'An unexpected error occurred' } };
    }
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
    clearProfile,
    followUser: handleFollowUser,
    unfollowUser: handleUnfollowUser,
    searchUsers: handleSearchUsers,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
