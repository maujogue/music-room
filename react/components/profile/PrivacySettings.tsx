import React, { useState } from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
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
import { Icon, CloseIcon, EditIcon } from '@/components/ui/icon';
import { PrivacySetting } from '@/types/user';

interface PrivacySettingsProps {
  currentSetting: PrivacySetting;
  isEdit: boolean;
  onSettingChange: (setting: PrivacySetting) => void;
  publicText?: string;
  friendsText?: string;
  privateText?: string;
  title?: string;
}

export default function PrivacySettings({
  currentSetting,
  isEdit,
  onSettingChange,
  publicText = 'Anyone can see this',
  friendsText = 'Only people you follow back can see this',
  privateText = 'Only you can see this',
  title = 'Privacy Settings',
}: PrivacySettingsProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(currentSetting);

  const getCurrentOption = () => {
    if (currentSetting === 'public') {
      return { icon: '🌍', title: 'Public', description: publicText };
    } else if (currentSetting === 'friends') {
      return { icon: '👥', title: 'Friends Only', description: friendsText };
    } else {
      return { icon: '🔒', title: 'Private', description: privateText };
    }
  };

  const getAvailableOptions = () => {
    const options = [];

    if (publicText) {
      options.push({
        value: 'public' as PrivacySetting,
        title: 'Public',
        description: publicText,
        icon: '🌍',
      });
    }

    if (friendsText) {
      options.push({
        value: 'friends' as PrivacySetting,
        title: 'Friends Only',
        description: friendsText,
        icon: '👥',
      });
    }

    if (privateText) {
      options.push({
        value: 'private' as PrivacySetting,
        title: 'Private',
        description: privateText,
        icon: '🔒',
      });
    }

    return options;
  };

  const handleConfirm = async () => {
    await onSettingChange(selectedSetting);
    setShowModal(false);
  };

  const currentOption = getCurrentOption();

  return (
    <VStack className='px-3'>
      <HStack className='w-full gap-2'>
        <HStack className='items-center gap-2 flex-1 my-1 mx-3'>
          <Text className='text-2xl'>{currentOption.icon}</Text>
          <VStack className='flex-1'>
            <Text className='text-base font-medium text-typography-900'>
              {currentOption.title}
            </Text>
            <Text className='text-sm text-typography-600'>
              {currentOption.description}
            </Text>
          </VStack>
        </HStack>

        {isEdit && (
          <Button
            onPress={() => {
              setSelectedSetting(currentSetting);
              setShowModal(true);
            }}
            size='sm'
            className='bg-transparent '
          >
            <ButtonText>
              <Icon as={EditIcon} size='md' color='black' />
            </ButtonText>
          </Button>
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} size='md'>
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Heading size='md'>
                Edit {title}
              </Heading>
              <ModalCloseButton>
                <Icon
                  as={CloseIcon}
                  size='md'
                />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <VStack className='gap-3'>
                {getAvailableOptions().map(option => (

                  <Button
                    key={option.value}
                    variant={
                      selectedSetting === option.value ? 'solid' : 'outline'
                    }
                    className={`w-full h-20 p-4 ${
                      selectedSetting === option.value
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-transparent border-typography-300'
                    }`}
                    onPress={() => setSelectedSetting(option.value)}
                  >
                    <HStack className='items-center gap-3 w-full'>
                      <Text className='text-2xl'>{option.icon}</Text>
                      <VStack className='flex-1 items-start'>
                        <Text
                          className={`text-md ${
                            selectedSetting === option.value
                              ? 'text-white'
                              : 'text-typography-900'
                          }`}
                        >
                          {option.title}
                        </Text>
                        <Text
                          className={`text-sm ${
                            selectedSetting === option.value
                              ? 'text-white/80'
                              : 'text-typography-600'
                          }`}
                        >
                          {option.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Button>
                ))}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant='outline'
                action='secondary'
                onPress={() => setShowModal(false)}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button onPress={handleConfirm}>
                <ButtonText>Confirm</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </HStack>
    </VStack>
  );
}
