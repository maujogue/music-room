import React from 'react';
import { View, Pressable } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Icon, ArrowLeftIcon } from '@/components/ui/icon';

interface ProfileHeaderProps {
  showBackButton: boolean;
  username: string;
  onBack: () => void;
}

export default function ProfileHeader({
  showBackButton,
  username,
  onBack,
}: ProfileHeaderProps) {
  if (!showBackButton) return null;

  return (
    <HStack className='items-center justify-between p-4 border-b border-typography-200'>
      <Pressable onPress={onBack}>
        <Icon as={ArrowLeftIcon} size='lg' />
      </Pressable>
      <Heading size='lg'>{username}</Heading>
      <View className='w-6' />
    </HStack>
  );
}
