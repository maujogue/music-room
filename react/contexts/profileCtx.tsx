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
import { getSession } from '@/services/session';

interface ProfileContextType {
  profile: UserInfo | null;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          () => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ error: any }> => {

    if (!user || !profile) {
      return {
        error: { message: 'User not authenticated or profile not loaded' },
      };
    }

    setIsLoading(true);
    try {
      const session  = await getSession()
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          updates: updates
        })
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        console.error('Error updating profile:', result.error);
        return { error: result.error };
      }

      setProfile(prev => (prev ? { ...prev, ...result.data } : result.data));
      return { error: null };

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
