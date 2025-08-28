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

export default function Profile() {
  const { profile, updateProfile } = useProfile();
  const [editProfile, setEditProfile] = useState(false);
  console.log(profile?.avatar_url);
  return (
    <View className='flex-1 pt-safe'>
      <VStack className='justify-center items-center p-6 gap-4'>
        <Button
          className={`w-28 h-8 mt-2 self-end ${editProfile ? 'bg-success-500' : 'bg-primary-500'}`}
          size='sm'
          onPress={() => setEditProfile(!editProfile)}
        >
          <ButtonText className='text-white'>
            {editProfile ? 'Save' : 'Edit Profile'}
          </ButtonText>
        </Button>
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
        <EditMusicTastes isEdit={editProfile} />
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
      </VStack>
    </View>
  );
}
