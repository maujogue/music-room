import { useState, useEffect } from 'react';
import { getUserProfile } from '@/services/profile';

interface UseUserFollowsReturn {
  users: UserWithFollowStatus[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserFollows(userId: string, type: FollowType): UseUserFollowsReturn {
  const [users, setUsers] = useState<UserWithFollowStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserProfile(userId);

      if (data) {
        const followData = type === 'followers' ? data.followers || [] : data.following || [];
        setUsers(followData);
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching user follows:', err);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('useUserFollows setup with userId:', userId, 'type:', type);

  useEffect(() => {
    console.log('useUserFollows called with userId:', userId, 'type:', type);
    fetchUsers();
  }, [userId, type]);

  const refetch = async () => {
    await fetchUsers();
  };

  return {
    users,
    isLoading,
    error,
    refetch,
  };
}
