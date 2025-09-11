import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import { Heading } from '@/components/ui/heading';
import { Icon, SearchIcon, ArrowLeftIcon } from '@/components/ui/icon';
import { useUserSearch, useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/authCtx';
import { useProfile } from '@/contexts/profileCtx';

// User type with follow status
interface UserWithFollowStatus {
  id: string;
  username: string;
  avatar_url?: string;
  is_following?: boolean;
  is_follower?: boolean;
  is_friend?: boolean;
}

export type UserListType = 'followers' | 'following' | 'all';

interface UserListProps {
  type: UserListType;
  initialUsers?: UserWithFollowStatus[];
  title: string;
  showFollowButtons?: boolean;
  targetUserId?: string; // For loading followers/following of specific user
}

export default function UserList({
  type,
  initialUsers = [],
  title,
  showFollowButtons = false,
}: UserListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] =
    useState<UserWithFollowStatus[]>(initialUsers);
  const { user } = useAuth();
  const { follow, unfollow } = useFollow();
  const { refreshFollowingData } = useProfile();
  const router = useRouter();

  // For 'all' type, use the search hook
  const { searchResults, isSearching, searchError, search } = useUserSearch();

  // Update filtered users when initial users change
  useEffect(() => {
    if (type !== 'all') {
      setFilteredUsers(initialUsers);
    }
  }, [initialUsers, type]);

  // Update filtered users when search query changes (for followers/following)
  useEffect(() => {
    if (type !== 'all' && searchQuery.trim()) {
      const filtered = initialUsers.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else if (type !== 'all') {
      setFilteredUsers(initialUsers);
    }
  }, [searchQuery, initialUsers, type]);

  // Update filtered users when search results change (for 'all' type)
  useEffect(() => {
    if (type === 'all') {
      setFilteredUsers(searchResults);
    }
  }, [searchResults, type]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (type === 'all') {
      search(query);
    }
  };

  useEffect(() => {
    if (type === 'all' && searchQuery) {
      search(searchQuery);
    }
  }, []);

  const handleFollowAction = async (userItem: UserWithFollowStatus) => {
    try {
      if (userItem.is_following) {
        await unfollow(userItem.id);
        // After unfollowing, check if the user is still a friend (mutual follow)
        setFilteredUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userItem.id
              ? { ...user, is_following: false, is_friend: user.is_follower && false }
              : user
          )
        );
      } else {
        await follow(userItem.id);
        // After following, check if the user is now a friend (mutual follow)
        setFilteredUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userItem.id
              ? { ...user, is_following: true, is_friend: user.is_follower && true }
              : user
          )
        );
      }

      // Refresh the profile context data to keep everything in sync
      await refreshFollowingData();
    } catch (error) {
      console.error('Error with follow action:', error);
    }
  };

  const handleUserPress = (userItem: UserWithFollowStatus) => {
    // Don't navigate to own profile
    if (userItem.id === user?.id) return;

    // Navigate to user profile
    router.push(`/profile/${userItem.id}`);
  };

  const renderUser = (userItem: UserWithFollowStatus) => {
    const isCurrentUser = userItem.id === user?.id;
    const canFollow = showFollowButtons && !isCurrentUser;
    const isFollowing = userItem.is_following;

    return (
      <Pressable
        key={userItem.id}
        onPress={() => handleUserPress(userItem)}
        className='flex-row items-center justify-between p-4 border-b border-typography-200'
      >
        <HStack className='items-center gap-3 flex-1'>
          <Avatar size='md'>
            <AvatarFallbackText>
              {userItem.username.charAt(0).toUpperCase()}
            </AvatarFallbackText>
            {userItem.avatar_url && (
              <AvatarImage source={{ uri: userItem.avatar_url }} />
            )}
          </Avatar>
          <VStack className='flex-1'>
            <HStack className='items-center gap-2'>
              <Text className='text-typography-900 font-semibold'>
                {userItem.username}
              </Text>
              {isCurrentUser && (
                <Text className='text-typography-500 text-sm'>(You)</Text>
              )}
              {userItem.is_friend && (
                <Text className='text-primary-500 text-sm font-medium'>
                  Friend
                </Text>
              )}
            </HStack>
          </VStack>
        </HStack>
        {canFollow && (
          <Button
            variant={isFollowing ? 'outline' : 'solid'}
            size='sm'
            onPress={e => {
              e.stopPropagation();
              handleFollowAction(userItem);
            }}
            className={isFollowing ? 'border-primary-500' : 'bg-primary-500'}
          >
            <ButtonText
              className={isFollowing ? 'text-primary-500' : 'text-white'}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </ButtonText>
          </Button>
        )}
      </Pressable>
    );
  };

  const getEmptyStateMessage = () => {
    if (type === 'all') {
      if (searchQuery) {
        return `No users found for "${searchQuery}"`;
      }
      return 'Search for users by username or email to find people to follow';
    }

    if (searchQuery) {
      return `No ${title.toLowerCase()} found for "${searchQuery}"`;
    }
    return `No ${title.toLowerCase()} yet`;
  };

  const getSearchPlaceholder = () => {
    if (type === 'all') {
      return 'Search by username or email...';
    }
    return `Search ${title.toLowerCase()}...`;
  };

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

      <VStack className='gap-4 flex-1 p-4'>
        {/* Search Bar */}
        <Input>
          <InputField
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </Input>

        {/* Error State */}
        {searchError && (
          <Text className='text-error-500 text-center'>{searchError}</Text>
        )}

        {/* Loading State */}
        {isSearching && (
          <Text className='text-typography-500 text-center'>Searching...</Text>
        )}

        {/* Empty State */}
        {!isSearching && filteredUsers.length === 0 && (
          <VStack className='items-center py-8'>
            {type === 'all' && !searchQuery ? (
              <Icon
                as={SearchIcon}
                size='xl'
                className='text-typography-300 mb-2'
              />
            ) : null}
            <Text className='text-typography-500 text-center'>
              {getEmptyStateMessage()}
            </Text>
          </VStack>
        )}

        {/* User List */}
        {filteredUsers.length > 0 && (
          <ScrollView className='flex-1' showsVerticalScrollIndicator={true}>
            <VStack className='gap-0'>
              {filteredUsers.map(userItem => (
                <View key={userItem.id}>{renderUser(userItem)}</View>
              ))}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </View>
  );
}
