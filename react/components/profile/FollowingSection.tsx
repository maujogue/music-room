import React, { useState } from 'react';
import { View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';

// User type with follow status
interface UserWithFollowStatus {
  id: string;
  username: string;
  avatar_url?: string;
  is_following?: boolean;
  is_follower?: boolean;
  is_friend?: boolean;
}

interface FollowingSectionProps {
  users: UserWithFollowStatus[];
  title: string;
  onPress?: () => void;
}

export default function FollowingSection({
  users,
  title,
  onPress,
}: FollowingSectionProps) {
  // Show first 3 users, then +X for the rest
  const displayUsers = users.slice(0, 3);
  const remainingCount = Math.max(0, users.length - 3);

  return (
    <VStack className='flex-1 gap-2'>
      <HStack className='justify-between'>
        <Text className='text-lg font-semibold text-typography-900'>
          {title}
        </Text>
        <Text className='text-2xl font-bold text-typography-900'>
          {users.length}
        </Text>
      </HStack>
      <Button
        variant='outline'
        className='w-full p-3 h-16 bg-background-50'
        onPress={onPress}
      >
        <HStack className='items-center gap-3 w-full'>
          <VStack className='flex-1 items-start'>
              <HStack className='gap-2'>
                {users.length > 0 ? (
                  displayUsers.map(user => (
                    <Avatar key={user.id} size='md'>
                      <AvatarFallbackText>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallbackText>
                      {user.avatar_url && (
                        <AvatarImage source={{ uri: user.avatar_url }} />
                      )}
                    </Avatar>
                  ))
                ) : (
                  <Text className='text-sm text-typography-500'>
                    No {title.toLowerCase()}
                  </Text>
                )}
                {remainingCount > 0 && (
                  <Avatar size='md' className='bg-typography-300'>
                    <AvatarFallbackText className='text-typography-600'>
                      +{remainingCount}
                    </AvatarFallbackText>
                  </Avatar>
                )}
              </HStack>
          </VStack>
        </HStack>
      </Button>
    </VStack>
  );
}
