import React from 'react';
import Search from '@/components/search/Search';
import UserListItem from '@/components/profile/UserListItem';

export default function ProfileSearchPage() {
  return (
    <Search
      placeholder='Search for users...'
      showFilters={false}
      defaultType='Users'
      renderItemUser={item => (
        <UserListItem user={item} key={item.id} showFollowButtons={true} />
      )}
    />
  );
}
