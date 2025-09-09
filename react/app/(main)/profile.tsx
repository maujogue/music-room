import { ImageSourcePropType, View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import EditProfileTextFeature from '@/components/profile/edit_text_feature';
import { useState } from 'react';
import { Center } from '@/components/ui/center';
import Avatar from '@/components/profile/edit_avatar';
import vibingImg from '@/assets/vibing.jpg';
import { useProfile } from '@/contexts/profileCtx';
import EditMusicTastes from '@/components/profile/edit_music_tastes';
import { Divider } from '@/components/ui/divider';
import { connectToSpotify } from '@/services/auth';
import PrivacySettings from '@/components/profile/PrivacySettings';
import { PrivacySetting } from '@/types/user';
import FollowingSection from '@/components/profile/FollowingSection';
import UserList from '@/components/profile/UserList';
import { HStack } from '@/components/ui/hstack';

export default function Profile() {
  const { profile, updateProfile, followers, following } = useProfile();
  const [editProfile, setEditProfile] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const handlePressOauthSpotify = async () => {
    try {
      await connectToSpotify();
    } catch (error) {
      console.error('Error during Spotify OAuth:', error);
    }
  };

  const handlePrivacyChange = async (privacy: PrivacySetting) => {
    await updateProfile({ privacy_setting: privacy });
  };

  return (
    <View className='flex-1 pt-safe'>
      <VStack className='justify-center items-center p-6 gap-4'>
        <View className='flex-row justify-between mt-2 w-full'>
          <Button
            className={`w-35 h-8 ${editProfile ? 'bg-success-500' : 'bg-primary-500'}`}
            size='sm'
            onPress={handlePressOauthSpotify}
          >
            <ButtonText className='text-white'>Connect with Spotify</ButtonText>
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

        <Center>
          <Avatar
            url={
              profile?.avatar_url
                ? { uri: profile.avatar_url }
                : (vibingImg as ImageSourcePropType)
            }
            onUpload={async filePath => {
              await updateProfile({ avatar_url: filePath });
            }}
            isEdit={editProfile}
          />
        </Center>
      </VStack>
      <VStack className='gap-4'>
        <EditProfileTextFeature
          type='username'
          currentText={profile?.username || ''}
          size='4xl'
          isEdit={editProfile}
          noHeader={true}
        />
        <EditMusicTastes
          currentText={profile?.music_genre || []}
          isEdit={editProfile}
        />
        <Divider />

        <EditProfileTextFeature
          type='bio'
          currentText={profile?.bio || ''}
          size='md'
          isEdit={editProfile}
          noHeader={false}
        />
        <Divider />
        <EditProfileTextFeature
          type='email'
          currentText={profile?.email || ''}
          size='md'
          isEdit={editProfile}
          noHeader={false}
        />
        <Divider />
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
        <HStack className='gap-4 px-3'>
          <FollowingSection
            users={followers}
            title='Followers'
            onPress={() => setShowFollowers(true)}
          />
          <FollowingSection
            users={following}
            title='Following'
            onPress={() => setShowFollowing(true)}
          />
        </HStack>

        {/* Find People Button */}
        <Button
          variant='outline'
          className='mx-3 mt-2'
          onPress={() => setShowUserSearch(true)}
        >
          <ButtonText>Find People to Follow</ButtonText>
        </Button>
      </VStack>

      {/* User List Modals */}
      <UserList
        onClose={() => setShowFollowers(false)}
        type='followers'
        initialUsers={followers}
        title='Followers'
        showFollowButtons={false}
      />

      <UserList
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        type='following'
        initialUsers={following}
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
