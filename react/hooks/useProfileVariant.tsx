import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/authCtx';
import { getUserProfile } from '@/services/profile';

export type ProfileVariant = 'own' | 'public' | 'friends' | 'private';

interface UseProfileVariantResult {
  variant: ProfileVariant | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useProfileVariant(userId: string): UseProfileVariantResult {
  const [variant, setVariant] = useState<ProfileVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!userId || !currentUser) {
      setIsLoading(false);
      return;
    }

    refreshVariant();
  }, [userId, currentUser]);

  const refreshVariant = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If it's the current user's own profile
      if (userId === currentUser?.id) {
        setVariant('own');
        setIsLoading(false);
        return;
      }

      // Get the target user's profile to check privacy settings
      const { data: user, error: profileError } = await getUserProfile(userId);
      if (!user) {
        setError('User not found', profileError);
        setIsLoading(false);
        return;
      }
      console.log('user profile', user);
      // Determine variant based on privacy settings and relationship
      switch (user.profile.privacy_setting) {
        case 'public':
          setVariant('public');
          break;
        case 'friends':
          setVariant(user.is_friend ? 'friends' : 'private');
          break;
        case 'private':
          setVariant('private');
          break;
        default:
          setVariant('public'); // Default to public
      }
    } catch (err) {
      setError('Failed to determine profile variant', err);
      console.error('Error determining profile variant:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { variant, isLoading, error, refreshVariant };
}
