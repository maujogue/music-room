import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileAvatarSection from '@/components/profile/ProfileAvatarSection';
import ProfileContent from '@/components/profile/ProfileContent';
import { useProfileLogic } from '@/hooks/useProfileLogic';
import { Spinner } from '../ui/spinner';

export type ProfileVariant = 'own' | 'public' | 'friends' | 'private';

interface ProfileProps {
  userId: string;
  variant: ProfileVariant;
  refreshVariant: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function Profile({
  userId,
  variant,
  refreshVariant,
  showBackButton = false,
  onBack,
}: ProfileProps) {
  const router = useRouter();
  const {
    // State
    profile,
    profileData,
    editProfile,
    isLoading,
    isRefreshingProfile,
    error,
    isOwnProfile,
    profileFollowers,
    profileFollowing,
    currentUser,

    // Permissions
    canViewEmail,
    canViewBio,
    canViewMusicGenre,
    canViewFollowers,
    canEdit,

    // Handlers
    handlePressOauthSpotify,
    handlePrivacyChange,
    handleFollowAction,
    handleEditToggle,
    handleAvatarUpload,
    signOut,
  } = useProfileLogic(userId, variant, refreshVariant);

  console.log('Variant:', variant, 'Profile:', profile);


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

  return (
    <View className='flex-1 pt-safe bg-background-0'>
      <ProfileHeader
        showBackButton={showBackButton}
        username={profile.username}
        onBack={onBack || (() => router.back())}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps='handled'
      >
        <ProfileAvatarSection
          profile={profile}
          canEdit={canEdit}
          editProfile={editProfile}
          isFollowing={profileData?.is_following}
          isOwnProfile={isOwnProfile}
          currentUserId={currentUser?.id}
          onEditToggle={handleEditToggle}
          onSpotifyConnect={handlePressOauthSpotify}
          onSignOut={signOut}
          onFollowAction={handleFollowAction}
          onAvatarUpload={handleAvatarUpload}
        />

        <ProfileContent
          profile={profile}
          userId={userId}
          canEdit={canEdit}
          editProfile={editProfile}
          canViewEmail={canViewEmail}
          canViewBio={canViewBio}
          canViewMusicGenre={canViewMusicGenre}
          canViewFollowers={canViewFollowers}
          isRefreshingProfile={isRefreshingProfile}
          profileFollowers={profileFollowers}
          profileFollowing={profileFollowing}
          variant={variant}
          onPrivacyChange={handlePrivacyChange}
        />
      </ScrollView>
    </View>
  );
}
