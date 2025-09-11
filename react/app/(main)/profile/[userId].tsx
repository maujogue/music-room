import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useProfileVariant } from '@/hooks/useProfileVariant';
import Profile from '@/components/profile/Profile';

export default function UserProfilePage() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { variant, isLoading, error, refreshVariant } = useProfileVariant(
    userId || ''
  );

  if (isLoading || error || !variant) {
    return (
      <Profile
        userId={userId || ''}
        variant='private' // Show private variant on error
        showBackButton={true}
      />
    );
  }

  return (
    <Profile
      userId={userId || ''}
      variant={variant}
      refreshVariant={refreshVariant}
      showBackButton={true}
    />
  );
}
