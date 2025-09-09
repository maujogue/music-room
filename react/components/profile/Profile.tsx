import React, { useState } from 'react';
import { ImageSourcePropType, View, Pressable } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Center } from '@/components/ui/center';
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Icon, ArrowLeftIcon } from '@/components/ui/icon';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/authCtx';
import { useProfile } from '@/contexts/profileCtx';
import { useFollow } from '@/hooks/useFollow';
import { supabase } from '@/services/supabase';
import EditProfileTextFeature from '@/components/profile/edit_text_feature';
import EditMusicTastes from '@/components/profile/edit_music_tastes';
import PrivacySettings from '@/components/profile/PrivacySettings';
import FollowingSection from '@/components/profile/FollowingSection';
import UserList from '@/components/profile/UserList';
import { PrivacySetting } from '@/types/user';
import vibingImg from '@/assets/vibing.jpg';

export type ProfileVariant = 'own' | 'public' | 'friends' | 'private';

interface ProfileProps {
  userId: string;
  variant: ProfileVariant;
  showBackButton?: boolean;
  onBack?: () => void;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  music_genre?: string[];
  privacy_setting?: 'public' | 'friends' | 'private';
  created_at: string;
}

interface ProfileData {
  profile: UserProfile | null;
  is_following: boolean;
  is_follower: boolean;
  is_friend: boolean;
  followers: any[];
  following: any[];
}

export default function Profile({
  userId,
  variant,
  showBackButton = false,
  onBack,
}: ProfileProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const {
    profile: ownProfile,
    updateProfile,
    followers,
    following,
  } = useProfile();
  const { handleFollowUser, handleUnfollowUser } = useFollow();
  const [editProfile, setEditProfile] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is the current user's own profile
  const isOwnProfile = variant === 'own' && userId === currentUser?.id;

  // Use own profile data or load other user's data
  const profile = isOwnProfile ? ownProfile : profileData?.profile;
  const profileFollowers = isOwnProfile
    ? followers
    : profileData?.followers || [];
  const profileFollowing = isOwnProfile
    ? following
    : profileData?.following || [];

  const handlePressOauthSpotify = async () => {
    try {
      // Add Spotify OAuth logic here
      console.log('Connect to Spotify');
    } catch (error) {
      console.error('Error during Spotify OAuth:', error);
    }
  };

  const handlePrivacyChange = async (privacy: PrivacySetting) => {
    if (isOwnProfile) {
      await updateProfile({ privacy_setting: privacy });
    }
  };

  const handleFollowAction = async () => {
    if (!profile || isOwnProfile) return;

    try {
      if (profileData?.is_following) {
        await handleUnfollowUser(profile.id, profile.username);
      } else {
        await handleFollowUser(profile.id, profile.username);
      }
      // Reload profile data to get updated follow status
      await loadUserProfile();
    } catch (error) {
      console.error('Error with follow action:', error);
    }
  };

  const loadUserProfile = async () => {
    if (isOwnProfile || !userId || !currentUser) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        setError('User not found');
        return;
      }

      // Get follow relationships
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('follower_id, following_id')
        .or(
          `and(follower_id.eq.${currentUser.id},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${currentUser.id})`
        );

      if (followsError) {
        console.error('Error fetching follow relationships:', followsError);
      }

      const isFollowing =
        follows?.some(
          f => f.follower_id === currentUser.id && f.following_id === userId
        ) || false;
      const isFollower =
        follows?.some(
          f => f.follower_id === userId && f.following_id === currentUser.id
        ) || false;
      const isFriend = isFollowing && isFollower;

      // Get followers and following for this user
      const { data: userFollowers } = await supabase
        .from('follows')
        .select(
          `
          created_at,
          follower:profiles!follows_follower_id_fkey(
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('following_id', userId);

      const { data: userFollowing } = await supabase
        .from('follows')
        .select(
          `
          created_at,
          following:profiles!follows_following_id_fkey(
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('follower_id', userId);

      const followersWithStatus = (userFollowers || []).map(follow => ({
        id: follow.follower.id,
        username: follow.follower.username,
        avatar_url: follow.follower.avatar_url,
        created_at: follow.created_at,
        is_follower: true,
        is_following: false,
        is_friend: false,
      }));

      const followingWithStatus = (userFollowing || []).map(follow => ({
        id: follow.following.id,
        username: follow.following.username,
        avatar_url: follow.following.avatar_url,
        created_at: follow.created_at,
        is_follower: false,
        is_following: true,
        is_friend: false,
      }));

      setProfileData({
        profile,
        is_following: isFollowing,
        is_follower: isFollower,
        is_friend: isFriend,
        followers: followersWithStatus,
        following: followingWithStatus,
      });
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error loading user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user profile when not own profile
  React.useEffect(() => {
    if (!isOwnProfile) {
      loadUserProfile();
    }
  }, [userId, isOwnProfile]);

  if (isLoading && !isOwnProfile) {
    return (
      <View className='flex-1 pt-safe bg-background-0'>
        <VStack className='items-center justify-center flex-1 gap-4'>
          <Text className='text-typography-500'>Loading profile...</Text>
        </VStack>
      </View>
    );
  }

  if (error || (!profile && !isOwnProfile)) {
    return (
      <View className='flex-1 pt-safe bg-background-0'>
        <VStack className='items-center justify-center flex-1 gap-4 p-6'>
          <Text className='text-error-500 text-center'>{error}</Text>
          {showBackButton && (
            <Button onPress={onBack || (() => router.back())}>
              <ButtonText>Go Back</ButtonText>
            </Button>
          )}
        </VStack>
      </View>
    );
  }

  if (!profile) return null;

  // Determine what content to show based on variant
  const canViewProfile = variant !== 'private';
  const canViewEmail =
    variant === 'own' ||
    (variant === 'public' && profile.privacy_setting !== 'private');
  const canViewBio = canViewProfile;
  const canViewMusicGenre = canViewProfile;
  const canViewFollowers = canViewProfile;
  const canEdit = variant === 'own';

  return (
    <View className='flex-1 pt-safe bg-background-0'>
      {/* Header */}
      {showBackButton && (
        <HStack className='items-center justify-between p-4 border-b border-typography-200'>
          <Pressable onPress={onBack || (() => router.back())}>
            <Icon as={ArrowLeftIcon} size='lg' />
          </Pressable>
          <Heading size='lg'>{profile.username}</Heading>
          <View className='w-6' />
        </HStack>
      )}

      <VStack className='justify-center items-center p-6 gap-4'>
        {/* Edit/Connect Buttons - Only for own profile */}
        {canEdit && (
          <View className='flex-row justify-between mt-2 w-full'>
            <Button
              className={`w-35 h-8 ${editProfile ? 'bg-success-500' : 'bg-primary-500'}`}
              size='sm'
              onPress={handlePressOauthSpotify}
            >
              <ButtonText className='text-white'>
                Connect with Spotify
              </ButtonText>
            </Button>
            <Button
              className={`w-28 h-8 ${editProfile ? 'bg-success-500' : 'bg-primary-500'}`}
              size='sm'
              onPress={() => setEditProfile(!editProfile)}
            >
              <ButtonText className='text-white'>
                {editProfile ? 'Save' : 'Edit Profile'}
              </ButtonText>
            </Button>
          </View>
        )}

        {/* Follow Button - Only for other users */}
        {!canEdit && profile.id !== currentUser?.id && (
          <Button
            variant={profileData?.is_following ? 'outline' : 'solid'}
            onPress={handleFollowAction}
            className={
              profileData?.is_following
                ? 'border-primary-500'
                : 'bg-primary-500'
            }
          >
            <ButtonText
              className={
                profileData?.is_following ? 'text-primary-500' : 'text-white'
              }
            >
              {profileData?.is_following ? 'Unfollow' : 'Follow'}
            </ButtonText>
          </Button>
        )}

        {/* Avatar */}
        <Center>
          <Avatar size='2xl'>
            <AvatarFallbackText>
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallbackText>
            {profile.avatar_url && (
              <AvatarImage source={{ uri: profile.avatar_url }} />
            )}
          </Avatar>
        </Center>
      </VStack>

      <VStack className='gap-4'>
        {/* Username */}
        <EditProfileTextFeature
          type='username'
          currentText={profile?.username || ''}
          size='4xl'
          isEdit={canEdit && editProfile}
          noHeader={true}
        />

        {/* Music Genre */}
        {canViewMusicGenre && (
          <EditMusicTastes
            currentText={profile?.music_genre || []}
            isEdit={canEdit && editProfile}
          />
        )}
        <Divider />

        {/* Bio */}
        {canViewBio && (
          <>
            <EditProfileTextFeature
              type='bio'
              currentText={profile?.bio || ''}
              size='md'
              isEdit={canEdit && editProfile}
              noHeader={false}
            />
            <Divider />
          </>
        )}

        {/* Email */}
        {canViewEmail && (
          <>
            <EditProfileTextFeature
              type='email'
              currentText={profile?.email || ''}
              size='md'
              isEdit={canEdit && editProfile}
              noHeader={false}
            />
            <Divider />
          </>
        )}

        {/* Privacy Settings - Only for own profile */}
        {canEdit && (
          <>
            <PrivacySettings
              currentSetting={profile?.privacy_setting || 'public'}
              isEdit={editProfile}
              onSettingChange={handlePrivacyChange}
              publicText='Anyone can see your profile'
              friendsText='Only people you follow back can see your profile'
              privateText='Only you can see your profile'
              title='Profile Visibility'
            />
            <Divider />
          </>
        )}

        {/* Followers/Following - Only if can view profile */}
        {canViewFollowers && (
          <>
            <HStack className='gap-4 px-3'>
              <FollowingSection
                users={profileFollowers}
                title='Followers'
                onPress={() => setShowFollowers(true)}
              />
              <FollowingSection
                users={profileFollowing}
                title='Following'
                onPress={() => setShowFollowing(true)}
              />
            </HStack>

            {/* Find People Button - Only for own profile */}
            {canEdit && (
              <Button
                variant='outline'
                className='mx-3 mt-2'
                onPress={() => setShowUserSearch(true)}
              >
                <ButtonText>Find People to Follow</ButtonText>
              </Button>
            )}
          </>
        )}

        {/* Private Profile Message */}
        {variant === 'private' && (
          <VStack className='items-center py-8 gap-4 px-6'>
            <Text className='text-typography-500 text-center text-lg'>
              This profile is private
            </Text>
            <Text className='text-typography-400 text-center'>
              You need to follow each other to see this profile
            </Text>
          </VStack>
        )}
      </VStack>

      {/* User List Modals */}
      <UserList
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        type='followers'
        initialUsers={profileFollowers}
        title='Followers'
        showFollowButtons={false}
      />

      <UserList
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        type='following'
        initialUsers={profileFollowing}
        title='Following'
        showFollowButtons={true}
      />

      <UserList
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        type='all'
        title='Find People'
        showFollowButtons={true}
      />
    </View>
  );
}
