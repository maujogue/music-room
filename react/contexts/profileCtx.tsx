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

interface ProfileContextType {
  profile: UserInfo | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<UserInfo>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
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
          (payload) => {
            // On any change, refresh the profile
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setIsLoading(false);
  };

  const value: ProfileContextType = {
    profile,
    isLoading,
    updateProfile,
    refreshProfile,
    clearProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
