import React from 'react';
import { useAuth } from '@/contexts/authCtx';
import Search from '@/components/search/Search';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Search defaultType='All' />
    </SafeAreaView>
  );
}
