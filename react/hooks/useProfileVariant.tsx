import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/authCtx';

export type ProfileVariant = 'own' | 'public' | 'friends' | 'private';

interface UseProfileVariantResult {
  variant: ProfileVariant | null;
  isLoading: boolean;
  error: string | null;
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

    determineVariant();
  }, [userId, currentUser]);

  const determineVariant = async () => {
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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('privacy_setting')
        .eq('id', userId)
        .single();

      if (profileError) {
        setError('User not found');
        return;
      }

      // Get follow relationships
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('follower_id, following_id')
        .or(
          `and(follower_id.eq.${currentUser.id},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${currentUser.id})`
        );

      if (followsError) {
        console.error('Error fetching follow relationships:', followsError);
        setVariant('private'); // Default to private if we can't determine relationship
        return;
      }

      const isFollowing =
        follows?.some(
          f => f.follower_id === currentUser.id && f.following_id === userId
        ) || false;
      const isFollower =
        follows?.some(
          f => f.follower_id === userId && f.following_id === currentUser.id
        ) || false;
      const isFriend = isFollowing && isFollower;

      // Determine variant based on privacy settings and relationship
      switch (profile.privacy_setting) {
        case 'public':
          setVariant('public');
          break;
        case 'friends':
          setVariant(isFriend ? 'friends' : 'private');
          break;
        case 'private':
          setVariant('private');
          break;
        default:
          setVariant('public'); // Default to public
      }
    } catch (err) {
      setError('Failed to determine profile variant');
      console.error('Error determining profile variant:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { variant, isLoading, error };
}
