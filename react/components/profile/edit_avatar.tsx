import { useState } from 'react';
import { Image, ImageSourcePropType, View, Text } from 'react-native';
import { AlertCircleIcon, CloseIcon, EditIcon, Icon } from '../ui/icon';
import { Button, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Heading } from '../ui/heading';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '../ui/form-control';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '@/contexts/profileCtx';

export default function EditAvatar({
  source,
  isEdit,
}: {
  source: ImageSourcePropType;
  isEdit: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { updateProfile } = useProfile();
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result: ImagePicker.ImagePickerResult =
      await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        mediaTypes: ['images'],
      });

    if (!result.canceled) {
      const img: ImagePicker.ImagePickerAsset = result.assets?.[0];
      if (img?.type !== 'image') {
        setError('Invalid image file');
        return;
      }
      if (img?.fileSize > 1024 * 1024 * 1) {
        setError('Image file size is too large');
        return;
      }
      setImage(img);
    }
    console.log(result);
  };
  const handleConfirm = async () => {
    const { error } = await updateProfile({ avatar_url: image?.uri });
    if (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } else {
      setShowModal(false);
    }
  };
  return (
    <HStack className='relative'>
      <Image
        source={image?.uri ? { uri: image.uri } : source}
        className='h-40 w-40 rounded-full self-start'
        alt='profile image'
        resizeMode='cover'
      />
      {isEdit && (
        <Button
          onPress={() => setShowModal(true)}
          size='sm'
          className='right-0 absolute'
        >
          <ButtonText>
            <Icon as={EditIcon} size='md' color='white' />
          </ButtonText>
        </Button>
      )}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setImage(null);
        }}
        size='md'
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size='md' className='text-typography-950'>
              Edit your Avatar
            </Heading>
            <ModalCloseButton>
              <Icon
                as={CloseIcon}
                size='md'
                className='stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900'
              />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <FormControl
              isInvalid={!!error || (image !== null && !!error)}
              size='md'
              isDisabled={false}
              isReadOnly={false}
              isRequired={true}
            >
              <Button
                onPress={pickImage}
                variant='outline'
                className='mb-2 w-full'
              >
                <ButtonText>
                  {image ? 'Change Image' : 'Choose Image'}
                </ButtonText>
              </Button>
              {image && (
                <View style={{ marginBottom: 8 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14 }}>
                    Selected: {image.fileName || image.uri}
                  </Text>
                </View>
              )}
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  {error
                    ? error
                    : image !== null && !error
                      ? 'A valid image file is required.'
                      : ''}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='outline'
              action='secondary'
              onPress={() => {
                setShowModal(false);
                setImage(null);
                setError(null);
              }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button isDisabled={!image} onPress={handleConfirm}>
              <ButtonText>Confirm</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </HStack>
  );
}
