import React from 'react';
import { useAuth } from '@/contexts/authCtx';
import Profile from '@/components/profile/Profile';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <Profile userId={user.id} />;
}
