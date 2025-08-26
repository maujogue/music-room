import { View } from 'react-native';
import {
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import EditProfileTextFeature from '@/components/profile/edit_text_feature';
import { useState } from 'react';
import { Center } from '@/components/ui/center';
import EditAvatar from '@/components/profile/edit_avatar';

export default function Profile() {
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
            source={require('../../assets/vibing.jpg')}
            isEdit={editProfile}
          />
        </Center>
      </VStack>
      <VStack className='gap-4'>
        <EditProfileTextFeature
          type='username'
          currentText={'Herrmann'}
          size='xl'
          isEdit={editProfile}
        />
        <EditProfileTextFeature
          type='bio'
          currentText={'La Feve lover'}
          size='md'
          isEdit={editProfile}
        />
        <EditProfileTextFeature
          type='email'
          currentText={'gclement@groscon.fr'}
          size='md'
          isEdit={editProfile}
        />
      </VStack>
    </View>
  );
}
