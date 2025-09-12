import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon, ArrowLeftIcon } from '@/components/ui/icon';
import { useUserFollows, FollowType } from '@/hooks/useUserFollows';
import UserListItem from '@/components/profile/UserListItem';
import { Spinner } from '@/components/ui/spinner';
import { followUser, unfollowUser } from '@/services/profile';

interface UserListProps {
  userId: string;
  type: FollowType;
  title: string;
  showFollowButtons?: boolean;
}

export default function UserList({
  userId,
  type,
  title,
  showFollowButtons = false,
}: UserListProps) {
  const router = useRouter();
  const { users, isLoading, error, refetch } = useUserFollows(userId, type);

  console.log('UserList users:', users);

  const handleUserPress = (userItem: UserWithFollowStatus) => {
    router.push(`/profile/${userItem.id}`);
  };

  const handleFollowAction = async (_userItem: UserWithFollowStatus) => {
    if (_userItem.is_following === true) {
      await unfollowUser(_userItem.id);
    } else {
      await followUser(_userItem.id);
    }
    await refetch();
  };

  if (isLoading) {
    return (
      <View className='flex-1 pt-safe bg-background-0'>
        <VStack className='items-center justify-center flex-1 gap-4'>
          <Spinner />
          <Text>Loading {title.toLowerCase()}...</Text>
        </VStack>
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex-1 pt-safe bg-background-0'>
        <VStack className='items-center justify-center flex-1 gap-4 p-6'>
          <Text className='text-error-500 text-center'>{error}</Text>
        </VStack>
      </View>
    );
  }

  return (
    <View className='flex-1 pt-safe bg-background-0'>
      {/* Header */}
      <HStack className='items-center justify-between p-4 border-b border-typography-200'>
        <Pressable onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size='lg' />
        </Pressable>
        <Heading size='lg'>{title}</Heading>
        <View className='w-6' />
      </HStack>

      {/* Empty State */}
      {users.length === 0 ? (
        <VStack className='items-center justify-center flex-1 p-6'>
          <Text className='text-typography-500 text-center'>
            No {title.toLowerCase()} yet
          </Text>
        </VStack>
      ) : (
        /* User List */
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          {users.map(userItem => (
            <UserListItem
              key={userItem.id}
              user={userItem}
              showFollowButtons={showFollowButtons}
              onUserPress={handleUserPress}
              handleFollowAction={handleFollowAction}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
