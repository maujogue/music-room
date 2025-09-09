import React from 'react';
import UserList from '@/components/profile/UserList';

export default function ProfileSearchPage() {
  return (
    <UserList
      type='all'
      title='Find People'
      showFollowButtons={true}
      initialUsers={[]}
    />
  );
}
