import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Center } from '@/components/ui/center';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Badge, BadgeText, BadgeIcon } from '@/components/ui/badge';
import { Icon, ArrowLeftIcon, SettingsIcon, CloseIcon } from '@/components/ui/icon';
import { Handshake } from 'lucide-react-native';
import {
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuSeparator,
} from '@/components/ui/menu';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/authCtx';
import { useProfile } from '@/contexts/profileCtx';
import { connectToSpotify } from '@/services/auth';
import { getUserProfile, followUser, unfollowUser } from '@/services/profile';
import EditProfileTextFeature from '@/components/profile/edit_text_feature';
import EditMusicTastes from '@/components/profile/edit_music_tastes';
import EditAvatar from '@/components/profile/edit_avatar';
import PrivacySettings from '@/components/profile/PrivacySettings';
import FollowingSection from '@/components/profile/FollowingSection';
import { PrivacySetting } from '@/types/user';
import vibingImg from '@/assets/vibing.jpg';
import { Spinner } from '../ui/spinner';

export type ProfileVariant = 'own' | 'public' | 'friends' | 'private';

interface ProfileProps {
  userId: string;
  variant: ProfileVariant;
  refreshVariant: () => void;
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
  refreshVariant,
  showBackButton = false,
  onBack,
}: ProfileProps) {
  const router = useRouter();
  const { user: currentUser, signOut } = useAuth();
  const {
    profile: ownProfile,
    updateProfile,
    followers,
    following,
  } = useProfile();
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
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
      await connectToSpotify();
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
        await unfollowUser(profileData.profile.id);
      } else {
        await followUser(profileData.profile.id);
      }
      setIsRefreshingProfile(true);
      await refreshVariant();
      await loadUserProfile();
      setIsRefreshingProfile(false);
    } catch (error) {
      console.error('Error with follow action:', error);
    }
  };

  const loadUserProfile = async () => {
    if (isOwnProfile || !userId || !currentUser) return;

    setError(null);

    try {
      const { data, error } = await getUserProfile(userId);

      if (error) {
        setError('User not found');
        console.error('Error loading user profile:', error);
        return;
      }

      if (!data) {
        setError('User not found');
        return;
      }

      setProfileData({
        profile: data.profile,
        is_following: data.is_following,
        is_follower: data.is_follower,
        is_friend: data.is_friend,
        followers: data.followers,
        following: data.following,
      });
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error loading user profile:', err);
    }
  };

  // Load user profile when not own profile
  React.useEffect(() => {
    if (!isOwnProfile) {
      setIsLoading(true);
      loadUserProfile();
      setIsLoading(false);
    }
  }, [userId, isOwnProfile]);

  if (isLoading && !isOwnProfile) {
    return (
      <View className='flex-1 pt-safe bg-background-0'>
        <VStack className='items-center justify-center flex-1 gap-4'>
          <Spinner />
        </VStack>
      </View>
    );
  }

  if (error) {
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

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <VStack className='justify-center items-center p-6 gap-4'>
          {/* Settings and Edit Profile Buttons - Only for own profile */}
          {canEdit && (
            <View className='flex-row justify-between mt-2 w-full gap-3'>
              {/* Settings Menu */}
              <View className='flex-1'>
                <Menu
                  trigger={({ ...triggerProps }) => (
                    <Button
                      {...triggerProps}
                      variant='outline'
                      className='w-full border-primary-500'
                    >
                      <ButtonText className='text-primary-500'>
                        Settings
                      </ButtonText>
                    </Button>
                  )}
                >
                  <MenuItem
                    textValue='Connect Spotify Account'
                    onPress={() => {
                      handlePressOauthSpotify();
                    }}
                  >
                    <Icon as={SettingsIcon} size='sm' className='mr-3' />
                    <MenuItemLabel>Connect Spotify Account</MenuItemLabel>
                  </MenuItem>

                  <MenuSeparator />

                  <MenuItem
                    textValue='Logout'
                    onPress={() => {
                      signOut();
                    }}
                  >
                    <Icon as={CloseIcon} size='sm' className='mr-3' />
                    <MenuItemLabel>Logout</MenuItemLabel>
                  </MenuItem>
                </Menu>
              </View>

              {/* Edit Profile Button */}
              <View className='flex-1'>
                <Button
                  className={`w-full ${editProfile ? 'bg-success-500' : 'bg-primary-500'}`}
                  onPress={() => setEditProfile(!editProfile)}
                >
                  <ButtonText className='text-white'>
                    {editProfile ? 'Save' : 'Edit Profile'}
                  </ButtonText>
                </Button>
              </View>
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
            <EditAvatar
              url={profile.avatar_url || vibingImg}
              onUpload={url => {
                if (isOwnProfile) {
                  console.log('Uploading avatar', url);
                  updateProfile({ avatar_url: url });
                }
              }}
              isEdit={canEdit && editProfile}
            />
          </Center>
        </VStack>

        <VStack className='gap-4'>
          {/* Username */}
          <EditProfileTextFeature
            type='username'
            currentText={profile?.username || ''}
            size='4xl'
            isEdit={canEdit && editProfile}
          />
          {isRefreshingProfile ? (
            <Spinner />
          ) : (
            <>
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
                      onPress={() => router.push(`/profile/${userId}/followers`)}
                    />
                    <FollowingSection
                      users={profileFollowing}
                      title='Following'
                      onPress={() => router.push(`/profile/${userId}/following`)}
                    />
                  </HStack>

                  {/* Find People Button - Only for own profile */}
                  {canEdit && (
                    <Button
                      variant='outline'
                      className='mx-3 mt-2'
                      onPress={() => router.push('/profile/search')}
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
            </>
          )}
        </VStack>
      </ScrollView>
    </View>
  );
}
