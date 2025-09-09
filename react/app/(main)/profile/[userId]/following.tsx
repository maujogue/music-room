import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import UserList from '@/components/profile/UserList';
import { getUserFollowing } from '@/services/follow';

export default function ProfileFollowingPage() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [initialUsers, setInitialUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFollowing = async () => {
      try {
        const result = await getUserFollowing(userId || '');

        if (result.error) {
          console.error('Error loading following:', result.error);
          setInitialUsers([]);
          return;
        }

        const users = result.data || [];

        // Map to include follow status
        const usersWithStatus = users.map(user => ({
          ...user,
          is_follower: false,
          is_following: true,
          is_friend: false,
        }));

        setInitialUsers(usersWithStatus);
      } catch (error) {
        console.error('Error loading following:', error);
        setInitialUsers([]);
      }
      setIsLoading(false);
    };

    loadFollowing();
  }, [userId]);

  if (isLoading) {
    return (
      <UserList
        type='following'
        title='Following'
        showFollowButtons={true}
        targetUserId={userId}
        initialUsers={[]}
      />
    );
  }

  return (
    <UserList
      type='following'
      title='Following'
      showFollowButtons={true}
      targetUserId={userId}
      initialUsers={initialUsers}
    />
  );
}
