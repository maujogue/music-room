import { View, ScrollView } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileContent from '@/components/profile/ProfileContent';
import { useProfileData } from '@/hooks/useProfileData';
import { Spinner } from '../ui/spinner';

export type ProfileVariant = 'own' | 'public' | 'friends' | 'private';

interface ProfileProps {
  userId: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function Profile({
  userId,
  showBackButton = false,
  onBack,
}: ProfileProps) {
  const router = useRouter();
  const {
    profile,
    variant,
    editProfile,
    isLoading,
    error,
    profileFollowers,
    profileFollowing,
    otherUserData,
    permissions,
    actions,
  } = useProfileData(userId);

  const isOwnProfile = variant === 'own';

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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps='handled'
      >
        <ProfileContent
          profile={profile}
          userId={userId}
          editProfile={editProfile}
          variant={variant}
          profileFollowers={profileFollowers}
          profileFollowing={profileFollowing}
          permissions={permissions}
          actions={actions}
        />
      </ScrollView>
      <ProfileActions
        isOwner={isOwnProfile}
        editProfile={editProfile}
        isFollowing={otherUserData?.is_following || false}
        actions={actions}
      />
    </View>
  );
}
