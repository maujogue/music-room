import React from 'react';
import { useAuth } from '@/contexts/authCtx';
import Search from '@/components/search/Search';
import { Box } from '@/components/ui/box';

export default function SearchPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Box className='flex-1 pt-8'>
      <Search defaultType='All'/>
    </Box>
  );
}
