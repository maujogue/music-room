import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ProfileUserList from '@/components/profile/ProfileUserList';

export default function ProfileFollowingPage() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return (
    <ProfileUserList userId={userId || ''} type='following' title='Following' />
  );
}
