import { ImageSourcePropType, View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import EditProfileTextFeature from '@/components/profile/edit_text_feature';
import { useState } from 'react';
import { Center } from '@/components/ui/center';
import EditAvatar from '@/components/profile/edit_avatar';

import vibingImg from '../../assets/vibing.jpg';
import { useProfile } from '@/contexts/profileCtx';

export default function Profile() {
  const { profile } = useProfile();
  const [editProfile, setEditProfile] = useState(false);
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
          <EditAvatar
            source={
              profile?.avatar_url
                ? { uri: profile.avatar_url }
                : (vibingImg as ImageSourcePropType)
            }
            isEdit={editProfile}
          />
        </Center>
      </VStack>
      <VStack className='gap-4'>
        <EditProfileTextFeature
          type='username'
          currentText={profile?.username || ''}
          size='xl'
          isEdit={editProfile}
        />
        <EditProfileTextFeature
          type='bio'
          currentText={profile?.bio || ''}
          size='md'
          isEdit={editProfile}
        />
        <EditProfileTextFeature
          type='email'
          currentText={profile?.email || ''}
          size='md'
          isEdit={editProfile}
        />
      </VStack>
    </View>
  );
}
