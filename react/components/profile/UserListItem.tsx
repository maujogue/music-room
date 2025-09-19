import { Pressable } from 'react-native';
import { useState } from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import { useRouter } from 'expo-router';
import { followUser, unfollowUser } from '@/services/profile';

interface UserListItemProps {
  user: UserInfo;
  showActionButtons?: boolean;
  onUserPress?: (user: UserWithFollowStatus) => void;
  handleActionButton?: (user: UserWithFollowStatus) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({
  user,
  showActionButtons = false,
  onUserPress,
  handleActionButton,
}) => {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(user.is_following);
  const [isLoading, setIsLoading] = useState(false);
  const isCurrentUser = false;
  const canFollow = showActionButtons && !isCurrentUser;

  if (!onUserPress) {
    onUserPress = (userItem: UserWithFollowStatus) => {
      router.push(`/profile/${userItem.id}`);
    };
  }

  if (!handleActionButton) {
    handleActionButton = async (userItem: UserWithFollowStatus) => {
      setIsLoading(true);
      try {
        if (isFollowing) {
          await unfollowUser(userItem.id);
          setIsFollowing(false);
        } else {
          await followUser(userItem.id);
          setIsFollowing(true);
        }
      } catch (error) {
        console.error('Error with follow action:', error);
      } finally {
        setIsLoading(false);
      }
    };
  }

  return (
    <Pressable
      onPress={() => onUserPress(user)}
      className='flex-row items-center justify-between p-4 border-b border-typography-200'
    >
      <HStack className='items-center gap-3 flex-1'>
        <Avatar size='md'>
          <AvatarFallbackText>
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallbackText>
          {user.avatar_url && <AvatarImage source={{ uri: user.avatar_url }} />}
        </Avatar>
        <VStack className='flex-1'>
          <HStack className='items-center gap-2'>
            <Text className='text-typography-900 font-semibold'>
              {user.username}
            </Text>
            {isCurrentUser && (
              <Text className='text-typography-500 text-sm'>(You)</Text>
            )}
            {user.is_friend && (
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
          disabled={isLoading}
          onPress={e => {
            e.stopPropagation();
            handleActionButton(user);
          }}
          className={isFollowing ? 'border-primary-500' : 'bg-primary-500'}
        >
          <ButtonText
            className={isFollowing ? 'text-primary-500' : 'text-white'}
          >
            {isLoading
              ? isFollowing
                ? 'Unfollowing...'
                : 'Following...'
              : isFollowing
                ? 'Unfollow'
                : 'Follow'}
          </ButtonText>
        </Button>
      )}
    </Pressable>
  );
};

export default UserListItem;
