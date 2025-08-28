import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import {
  Icon,
  CloseIcon,
  AlertCircleIcon,
  EditIcon,
} from '@/components/ui/icon';
import { useState } from 'react';
import { Input, InputField } from '../ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';
import { useProfile } from '@/contexts/profileCtx';
import { UserInfo } from '@/types/user';

export default function EditProfileTextFeature({
  type,
  currentText,
  size,
  isEdit,
  noHeader,
}: {
  type: 'bio' | 'email' | 'username';
  currentText: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | undefined;
  isEdit: boolean;
  noHeader: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState(currentText);
  const [error, setError] = useState<string | null>(null);
  const { updateProfile } = useProfile();

  const isValid =
    type === 'email'
      ? validateEmail(text)
      : type === 'bio'
        ? validateBio(text)
        : validateText(text);

  const handleConfirm = async () => {
    const data: Partial<UserInfo> = {
      [type]: text,
    };
    const { error } = await updateProfile(data);
    if (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } else {
      setShowModal(false);
    }
  };

  return (
    <VStack className='px-3'>
      {!noHeader && <Heading size='sm'>{type}</Heading>}
      <HStack className='w-full gap-2'>
        <Heading size={size} className='my-1 mx-3 flex-1'>
          {currentText}
        </Heading>

        {isEdit && (
          <Button
            onPress={() => setShowModal(true)}
            size='sm'
            className='bg-transparent'
          >
            <ButtonText>
              <Icon as={EditIcon} size='md' color='black' />
            </ButtonText>
          </Button>
        )}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
          }}
          size='md'
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Heading size='md' className='text-typography-950'>
                Edit your {type}
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
                isInvalid={!isValid}
                size='md'
                isDisabled={false}
                isReadOnly={false}
                isRequired={true}
              >
                {type === 'bio' ? (
                  <Textarea size='md'>
                    <TextareaInput
                      value={text}
                      onChangeText={setText}
                      placeholder={`Enter your ${type}`}
                    />
                  </Textarea>
                ) : (
                  <Input size='md'>
                    <InputField
                      type='text'
                      value={text}
                      onChangeText={setText}
                      placeholder={`Enter your ${type}`}
                    />
                  </Input>
                )}
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    {error || `A valid ${type} is required.`}
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
                }}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button isDisabled={!isValid} onPress={handleConfirm}>
                <ButtonText>Confirm</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </HStack>
    </VStack>
  );
}

function validateEmail(email: string) {
  return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}

function validateText(text: string) {
  return text.length > 0;
}

function validateBio(text: string) {
  return text.length > 0 && text.length < 100;
}
