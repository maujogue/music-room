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
  getCurrentUserProfile,
  updateProfile as updateProfileAPI,
  followUser,
  unfollowUser,
} from '@/services/profile';
import { connectToSpotify, connectToGoogle } from '@/services/auth';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface ProfileContextType {
  profile: UserInfo | null;
  isConnectedToSpotify?: boolean;
  isConnectedToGoogle?: boolean;
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
  connectSpotify: () => Promise<{ error: any }>;
  connectGoogle: () => Promise<{ error: any }>;
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
  const {
    profile,
    loading: isLoading,
    refetch: refreshProfile,
  } = useCurrentUser();

  const [isConnectedToSpotify, setIsConnectedToSpotify] =
    useState<boolean>(false);
  const [isConnectedToGoogle, setIsConnectedToGoogle] =
    useState<boolean>(false);

  // Derive followers/following from profile data
  const followers = profile?.followers || [];
  const following = profile?.following || [];

  // Check connection status when user or profile changes
  useEffect(() => {
    if (user) {
      const hasGoogleIdentity = user.identities?.some(
        (identity: any) => identity.provider === 'google'
      );
      setIsConnectedToGoogle(!!hasGoogleIdentity);
    } else {
      setIsConnectedToGoogle(false);
    }

    if (profile) {
      setIsConnectedToSpotify(!!profile.is_connected_to_spotify);
    } else {
      setIsConnectedToSpotify(false);
    }
  }, [user, profile]);

  const updateProfile = async (
    updates: Partial<UserInfo>
  ): Promise<{ error: any }> => {
    if (!user) {
      return {
        error: { message: 'User not authenticated' },
      };
    }
    try {
      await updateProfileAPI(updates);
      // Invalidate query to trigger refetch
      await refreshProfile();
      return { error: null };
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return { error: { message: error || 'An unexpected error occurred' } };
    }
  };

  const clearProfile = () => {
    // With React Query, we might clear the query cache if needed,
    // but usually signing out (which clears 'user') handles it via 'enabled: !!user'
    // For manual clearing we could queryClient.removeQueries... but let's keep it simple for now or no-op
    // effectively state is cleared if user is null
  };

  const handleFollowUser = async (userId: string): Promise<{ error: any }> => {
    try {
      const { error } = await followUser(userId);
      if (!error) {
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
        await refreshProfile();
      }
      return { error };
    } catch (error) {
      console.error('Unexpected error unfollowing user:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const connectSpotify = async (): Promise<{ error: any }> => {
    try {
      await connectToSpotify();
      await refreshProfile(); // Refresh to update connection status
      return { error: null };
    } catch (error) {
      console.error('Error during Spotify OAuth:', error);
      return { error };
    }
  };

  const connectGoogle = async (): Promise<{ error: any }> => {
    try {
      await connectToGoogle();
      await refreshProfile();
      return { error: null };
    } catch (error) {
      console.error('Error during Google OAuth:', error);
      return { error };
    }
  };

  const value: ProfileContextType = {
    profile,
    isConnectedToSpotify,
    isConnectedToGoogle,
    connectSpotify,
    connectGoogle,
    isLoading,
    followers,
    following,
    followersCount: followers.length,
    followingCount: following.length,
    updateProfile,
    refreshProfile: async () => {
      await refreshProfile();
    }, // adapter
    clearProfile,
    followUser: handleFollowUser,
    unfollowUser: handleUnfollowUser,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
