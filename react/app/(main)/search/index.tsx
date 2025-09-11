import React from 'react';
import { useAuth } from '@/contexts/authCtx';
import Search from '@/components/search/Search';

export default function SearchPage() {
  const { user } = useAuth();

  if (!user) {
	return null;
  }

  return <Search defaultType="All" />;
}
