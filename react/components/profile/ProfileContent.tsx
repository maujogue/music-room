import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import EditProfileTextFeature from '@/components/profile/edit_text_feature';
import EditMusicTastes from '@/components/profile/edit_music_tastes';
import PrivacySettings from '@/components/profile/PrivacySettings';
import FollowingSection from '@/components/profile/FollowingSection';
import SubscriptionBadge from '@/components/subscription/SubscriptionBadge';
import { PrivacySetting } from '@/types/user';
import ProfileAvatarSection from '@/components/profile/ProfileAvatarSection';

interface ProfileContentProps {
  profile: any;
  userId: string;
  editProfile: boolean;
  variant: string;
  profileFollowers: any[];
  profileFollowing: any[];
  permissions: {
    canEdit: boolean;
    canViewEmail: boolean;
    canViewBio: boolean;
    canViewMusicGenre: boolean;
    canViewFollowers: boolean;
  };
  actions: {
    handlePrivacyChange: (privacy: PrivacySetting) => void;
    handleEditToggle: () => void;
    handleSpotifyConnect: () => void;
    handleFollowAction?: () => void;
    handleAvatarUpload: (url: string) => void;
    signOut: () => void;
    handleGoogleConnect?: () => void;
  };
}

export default function ProfileContent({
  profile,
  userId,
  editProfile,
  variant,
  profileFollowers,
  profileFollowing,
  permissions,
  actions,
}: ProfileContentProps) {
  const router = useRouter();
  return (
    <VStack className='gap-4 mt-7'>
      <HStack className='items-center'>
        {/* Avatar */}
        <ProfileAvatarSection
          profile={profile}
          canEdit={permissions.canEdit}
          editProfile={editProfile}
          actions={actions}
        />

        {/* Username */}
        <VStack className='flex-1 self-start pt-6'>
          {permissions.canEdit && <SubscriptionBadge />}
          <EditProfileTextFeature
            type='username'
            currentText={profile?.username}
            size='4xl'
            isEdit={permissions.canEdit && editProfile}
          />
          {/* Music Genre */}
          {permissions.canViewMusicGenre && (
            <EditMusicTastes
              currentText={profile?.music_genre || []}
              isEdit={permissions.canEdit && editProfile}
            />
          )}
          {/* Subscription Badge - only show on own profile */}
        </VStack>
      </HStack>

      <Divider />

      {/* Bio */}
      {permissions.canViewBio && (
        <>
          <EditProfileTextFeature
            type='bio'
            currentText={profile?.bio || ''}
            size='md'
            isEdit={permissions.canEdit && editProfile}
          />
          <Divider />
        </>
      )}

      {/* Email */}
      {permissions.canViewEmail && (
        <>
          <EditProfileTextFeature
            type='email'
            currentText={profile?.email || ''}
            size='md'
            isEdit={permissions.canEdit && editProfile}
          />
          <Divider />
        </>
      )}

      {/* Privacy Settings - Only for own profile */}
      {permissions.canEdit && (
        <>
          <PrivacySettings
            currentSetting={profile?.privacy_setting || 'public'}
            isEdit={editProfile}
            onSettingChange={actions.handlePrivacyChange}
            publicText='Anyone can see your profile'
            friendsText='Only people you follow back can see your profile'
            privateText='Only you can see your profile'
            title='Profile Visibility'
          />
          <Divider />
        </>
      )}

      {/* Stats Link - Only for own profile */}
      {variant === 'own' && (
        <VStack className='px-3'>
          <Button
            variant='outline'
            className='justify-between border-secondary-200 bg-secondary-50 active:bg-secondary-100'
            onPress={() => router.push('/profile/stats')}
          >
            <HStack className='items-center gap-3'>
              <Text className='font-bold text-typography-900'>
                View My Stats & Leaderboard
              </Text>
            </HStack>
          </Button>
        </VStack>
      )}

      {/* Followers/Following - Only if can view profile */}
      {permissions.canViewFollowers && (
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
  );
}
