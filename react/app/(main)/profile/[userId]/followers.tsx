import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import UserList from '@/components/profile/UserList';
import { getUserFollowers } from '@/services/follow';

export default function ProfileFollowersPage() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [initialUsers, setInitialUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        const result = await getUserFollowers(userId || '');

        if (result.error) {
          console.error('Error loading followers:', result.error);
          setInitialUsers([]);
          return;
        }

        const users = result.data || [];

        // Map to include follow status
        const usersWithStatus = users.map(user => ({
          ...user,
          is_follower: true,
          is_following: false,
          is_friend: false,
        }));

        setInitialUsers(usersWithStatus);
      } catch (error) {
        console.error('Error loading followers:', error);
        setInitialUsers([]);
      }
      setIsLoading(false);
    };

    loadFollowers();
  }, [userId]);

  if (isLoading) {
    return (
      <UserList
        type='followers'
        title='Followers'
        showFollowButtons={false}
        targetUserId={userId}
        initialUsers={[]}
      />
    );
  }

  return (
    <UserList
      type='followers'
      title='Followers'
      showFollowButtons={false}
      targetUserId={userId}
      initialUsers={initialUsers}
    />
  );
}
