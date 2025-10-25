import React from 'react';
import { useAuth } from '@/contexts/authCtx';
import Profile from '@/components/profile/Profile';
import { ProfileProvider } from '@/contexts/profileCtx';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <ProfileProvider>
      <Profile userId={user.id} />
    </ProfileProvider>
  );
}
