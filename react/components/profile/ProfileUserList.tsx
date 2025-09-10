import React, { useState, useEffect } from 'react';
import UserList from '@/components/profile/UserList';
import { getUserFollowers, getUserFollowing } from '@/services/follow';

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
  const [initialUsers, setInitialUsers] = useState<any[]>([]);
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
          setInitialUsers([]);
          return;
        }

        const users = result.data || [];

        // Map to include follow status based on type
        const usersWithStatus = users.map(user => ({
          ...user,
          is_follower: type === 'followers',
          is_following: type === 'following',
          is_friend: false,
        }));

        setInitialUsers(usersWithStatus);
      } catch (error) {
        console.error(`Error loading ${type}:`, error);
        setInitialUsers([]);
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
        targetUserId={userId}
        initialUsers={[]}
      />
    );
  }

  return (
    <UserList
      type={type}
      title={title}
      showFollowButtons={true}
      targetUserId={userId}
      initialUsers={initialUsers}
    />
  );
}
