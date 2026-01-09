import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Image } from 'react-native';
import { Switch } from '@/components/ui/switch';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Icon, CheckIcon, AlertCircleIcon } from '@/components/ui/icon';
import { Pen } from 'lucide-react-native';
import { Center } from '@/components/ui/center';
import { FormControl } from '@/components/ui/form-control';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { useAppToast } from '@/hooks/useAppToast';
import * as ImagePicker from 'expo-image-picker';
import FloatButton from '@/components/generics/FloatButton';
import { uploadImageToSupabase } from '@/utils/uploadImage';
import { getRandomImage } from '@/utils/randomImage';

type Props = {
  onSubmit: (payload: PlaylistPayload) => Promise<void> | void;
  ApiError: string;
  initialValues?: Playlist;
};

export default function EditPlayListForm({
  initialValues,
  ApiError,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [isPrivate, setIsPrivate] = useState<boolean>(
    initialValues?.is_private ?? true
  );
  const [isCollaborative, setIsCollaborative] = useState<boolean>(
    initialValues?.is_collaborative ?? false
  );

  const [imageUrl, setImageUrl] = useState(initialValues?.cover_url ?? null);

  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useAppToast();

  const validate = (): boolean => {
    if (!name.trim()) {
      setError('Required name.');
      return false;
    }

    setError(null);
    return true;
  };

  const handlePressValid = async () => {
    if (!validate()) return;

    let finalCoverUrl = imageUrl;

    // If no cover URL is provided, use a random default image (same logic as events)
    if (!finalCoverUrl) {
      try {
        const randomImageAsset = getRandomImage();
        const resolvedAsset = Image.resolveAssetSource(randomImageAsset);
        if (resolvedAsset?.uri) {
          // Upload the default image to storage
          finalCoverUrl = await uploadImageToSupabase(
            resolvedAsset.uri,
            'avatars',
            'playlists'
          );
        }
      } catch (err) {
        console.error('Failed to upload default playlist image:', err);
        // Continue without cover_url if upload fails
      }
    }

    const payload: PlaylistPayload = {
      name: name.trim(),
      is_private: isPrivate,
      is_collaborative: isCollaborative,
      description: description.trim() || undefined,
      cover_url: finalCoverUrl || undefined,
    };

    try {
      await onSubmit(payload);
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error while creation.');
    }
  };

  async function uploadCover() {
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
        return;
      }

      const image = result.assets[0];

      if (!image.uri) {
        throw new Error('No image uri!');
      }

      const publicUrl = await uploadImageToSupabase(
        image.uri,
        'avatars',
        'playlists'
      );

      setImageUrl(publicUrl);

      toast.show({
        title: 'uploaded playlist cover',
        description: 'Image uploaded successfully',
      });
    } catch (err: any) {
      toast.error({
        title: 'uploading playlist cover image failed',
        description: err.message,
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <FormControl className='p-4 border rounded-lg border-outline-300'>
      <VStack space='md'>
        <Box>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: '100%',
                height: 300,
                marginTop: 0,
                marginBottom: 10,
              }}
              resizeMode='cover'
              alt="Playlist's cover image"
            />
          ) : (
            <Box
              className='bg-white items-center justify-center'
              style={{ width: '100%', height: 300, marginTop: 0 }}
            >
              <Text className='text-typography-500'>No image selected</Text>
            </Box>
          )}
          <Button
            onPress={uploadCover}
            disabled={uploading}
            className='mb-2 absolute right-2 top-2 z-10 rounded-full bg-primary-500/70 w-12 h-12 p-1.5'
          >
            <ButtonIcon size='lg' className='w-7 h-7' as={Pen} />
          </Button>

          <Text>Name</Text>
          <Input>
            <InputField
              placeholder='Coolich Playlist'
              value={name}
              onChangeText={setName}
              autoCapitalize='sentences'
            />
          </Input>
        </Box>

        <Box>
          <Text>Description</Text>
          <Textarea className=''>
            <TextareaInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical='top'
              autoCapitalize='sentences'
            />
          </Textarea>
        </Box>

        <VStack className='items-start'>
          <HStack className='items-center'>
            <Switch
              value={isPrivate}
              onToggle={() => {
                setIsPrivate(prev => !prev);
              }}
            />
            <Text>Private</Text>
          </HStack>

          <HStack className='items-center'>
            <Switch
              value={isCollaborative}
              onToggle={() => {
                setIsCollaborative(prev => !prev);
              }}
            />
            <Text>Collaborative</Text>
          </HStack>
        </VStack>

        {error ? (
          <Center>
            <HStack space='xs' className='items-center'>
              <Icon as={AlertCircleIcon} size='sm' />
              <Text>{error}</Text>
            </HStack>
          </Center>
        ) : (
          <Center className='p-3' />
        )}

        {ApiError !== '' ? (
          <Center>
            <HStack space='xs' className='items-center color-red-500'>
              <Icon as={AlertCircleIcon} size='sm' />
              <Text>{ApiError}</Text>
            </HStack>
          </Center>
        ) : (
          <Center className='p-3' />
        )}

        {/* Submit */}
        <FloatButton onPress={handlePressValid} icon={CheckIcon} />
      </VStack>
    </FormControl>
  );
}
