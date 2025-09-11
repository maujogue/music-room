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
import { useUserSearch } from '@/hooks/useSearch';
import { followUser, unfollowUser } from '@/services/profile';
import { useAuth } from '@/contexts/authCtx';
import { useProfile } from '@/contexts/profileCtx';

interface UserListItemProps {
	user: UserInfo;
	showFollowButtons?: boolean;
	onUserPress?: (user: UserWithFollowStatus) => void;
	onFollowAction?: (user: UserWithFollowStatus) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({
	user,
	showFollowButtons = false,
	onUserPress,
	onFollowAction
}) => {
	const isCurrentUser = false;
	const canFollow = showFollowButtons && !isCurrentUser;
	const isFollowing = user.is_following;

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
					{user.avatar_url && (
						<AvatarImage source={{ uri: user.avatar_url }} />
					)}
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
					onPress={e => {
						e.stopPropagation();
						onFollowAction(user);
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

export default UserListItem;
