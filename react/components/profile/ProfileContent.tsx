import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { useRouter } from 'expo-router';
import EditProfileTextFeature from '@/components/profile/edit_text_feature';
import EditMusicTastes from '@/components/profile/edit_music_tastes';
import PrivacySettings from '@/components/profile/PrivacySettings';
import FollowingSection from '@/components/profile/FollowingSection';
import { PrivacySetting } from '@/types/user';

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
    <VStack className='gap-4'>
      {/* Username */}
      <EditProfileTextFeature
        type='username'
        currentText={profile?.username || ''}
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

          {/* Find People Button - Only for own profile */}
          {permissions.canEdit && (
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
    </VStack>
  );
}
