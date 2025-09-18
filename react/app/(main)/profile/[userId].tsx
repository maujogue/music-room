import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import Profile from '@/components/profile/Profile';

export default function UserProfilePage() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return (
    <Profile
      userId={userId || ''}
      showBackButton={true}
    />
  );
}
