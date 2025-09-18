import React, { useState, useEffect } from 'react';
import UserList from '@/components/profile/UserList';
import { getUserFollowers, getUserFollowing } from '@/services/profile';

type ProfileUserListType = 'followers' | 'following';

interface ProfileUserListProps {
  userId: string;
  type: ProfileUserListType;
  title: string;
}

export default function ProfileUserList({
  userId,
  type,
  title,
}: ProfileUserListProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Choose the appropriate function based on type
        const result =
          type === 'followers'
            ? await getUserFollowers(userId)
            : await getUserFollowing(userId);

        if (result.error) {
          console.error(`Error loading ${type}:`, result.error);
          return;
        }
      } catch (error) {
        console.error(`Error loading ${type}:`, error);
      }
      setIsLoading(false);
    };

    loadUsers();
  }, [userId, type]);

  if (isLoading) {
    return (
      <UserList
        type={type}
        title={title}
        showFollowButtons={true}
        userId={userId}
      />
    );
  }

  return (
    <UserList
      type={type}
      title={title}
      showFollowButtons={true}
      userId={userId}
    />
  );
}
