import { useState } from 'react';
import { supabase } from '@/services/supabase';
import { Alert, ImageSourcePropType } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import { EditIcon, Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';

interface Props {
  url: string | ImageSourcePropType;
  onUpload: (filePath: string) => void;
  isEdit: boolean;
}

export default function EditAvatar({ url, onUpload, isEdit }: Props) {
  const [uploading, setUploading] = useState(false);

  async function uploadAvatar() {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.');
        return;
      }

      const image = result.assets[0];
      console.log('Got image', image);

      if (!image.uri) {
        throw new Error('No image uri!');
      }

      const arraybuffer = await fetch(image.uri).then(res => res.arrayBuffer());

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `profiles/${Date.now()}.${fileExt}`;
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      onUpload(publicUrl);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <HStack className='relative'>
      <Image
        source={url}
        className='rounded-full self-start'
        size='lg'
        alt='profile image'
        resizeMode='cover'
      />
      {isEdit && (
        <Button
          onPress={uploadAvatar}
          size='sm'
          className='right-0 absolute'
          disabled={uploading}
        >
          <Icon as={EditIcon} size='md' color='white' />
        </Button>
      )}
    </HStack>
  );
}
