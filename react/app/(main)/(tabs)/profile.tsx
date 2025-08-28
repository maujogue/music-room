import { ImageSourcePropType, View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import EditProfileTextFeature from '@/components/profile/edit_text_feature';
import { useState } from 'react';
import { Center } from '@/components/ui/center';
import Avatar from '@/components/profile/edit_avatar';
import vibingImg from '@/assets/vibing.jpg';
import { useProfile } from '@/contexts/profileCtx';

export default function Profile() {
  const { profile, updateProfile } = useProfile();
  const [editProfile, setEditProfile] = useState(false);
  console.log(profile?.avatar_url);

  const connectToSpotify = () => {
    fetch('http://127.0.0.1:54321/functions/v1/auth/spotify', {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        if (data.url) {
          // Redirect the user to the Spotify authentication URL
          window.location.href = data.url;
        } else {
          console.error('No URL found in response:', data);
        }
      })
      .catch(error => {
        console.error('Error during Spotify authentication:', error);
      });
  }

  return (
    <View className='flex-1 pt-safe'>
    <VStack className='justify-center items-center p-6 gap-4'>
            <View className="flex-row justify-between mt-2 w-full">
              <Button
                className={`w-35 h-8 ${editProfile ? 'bg-success-500' : 'bg-primary-500'}`}
                size="sm"
                onPress={connectToSpotify}
              >
                <ButtonText className="text-white">
                  Connect with Spotify
                </ButtonText>
              </Button>
              <Button
                className={`w-28 h-8 ${editProfile ? 'bg-success-500' : 'bg-primary-500'}`}
                size="sm"
                onPress={() => setEditProfile(!editProfile)}
              >
                <ButtonText className="text-white">
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
