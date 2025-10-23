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
  return (
    <UserList
      type={type}
      title={title}
      showFollowButtons={true}
      userId={userId}
    />
  );
}
