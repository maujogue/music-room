import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import {
  Avatar,
  AvatarGroup,
  AvatarBadge,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
} from '@/components/ui/modal';
import { Heading } from '@/components/ui/heading';
import { Icon, CloseIcon } from '@/components/ui/icon';

// Dummy user type for now
interface DummyUser {
  id: string;
  username: string;
  avatar_url?: string;
}

interface FollowingSectionProps {
  users: DummyUser[];
  title: string;
  onPress?: () => void;
}

export default function FollowingSection({
  users,
  title,
}: FollowingSectionProps) {
  const [showModal, setShowModal] = useState(false);

  // Show first 3 users, then +X for the rest
  const displayUsers = users.slice(0, 4);
  const remainingCount = Math.max(0, users.length - 4);

  const handlePress = () => {
    setShowModal(true);
  };

  const renderUser = ({ item: user }: { item: DummyUser }) => (
    <HStack className='items-center gap-3 p-3 border-b border-typography-200'>
      <Avatar size='md'>
        <AvatarFallbackText>
          {user.username.charAt(0).toUpperCase()}
        </AvatarFallbackText>
        {user.avatar_url && <AvatarImage source={{ uri: user.avatar_url }} />}
      </Avatar>
      <VStack className='flex-1'>
        <Text className='text-base font-medium text-typography-900'>
          {user.username}
        </Text>
      </VStack>
    </HStack>
  );

  return (
    <VStack className='flex-1 gap-2'>
      <HStack className='justify-between'>
        <Text className='text-lg font-semibold text-typography-900'>
          {title}
        </Text>

        <Text className='text-2xl font-bold text-typography-900'>
          {users.length}
        </Text>
      </HStack>
      <Button
        variant='outline'
        className='w-full p-3 h-16 bg-background-50'
        onPress={handlePress}
      >
        <HStack className='items-center gap-3 w-full'>
          <VStack className='flex-1 items-start'>
            {users.length > 0 && (
              <AvatarGroup style={{ pointerEvents: 'none' }}>
                {displayUsers.map((user, index) => (
                  <Avatar key={user.id} size='md'>
                    <AvatarFallbackText>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallbackText>
                    {user.avatar_url && (
                      <AvatarImage source={{ uri: user.avatar_url }} />
                    )}
                  </Avatar>
                ))}
                {remainingCount > 0 && (
                  <Avatar size='md' style={{ pointerEvents: 'none' }}>
                    <AvatarFallbackText>
                      {'+ ' + remainingCount}
                    </AvatarFallbackText>
                  </Avatar>
                )}
              </AvatarGroup>
            )}
          </VStack>
        </HStack>
      </Button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size='lg'>
        <ModalBackdrop />
        <ModalContent className='h-5/6'>
          <ModalHeader>
            <Heading size='lg'>{title}</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} size='md' />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody className='flex-1'>
            {users.length === 0 ? (
              <VStack className='items-center py-8'>
                <Text className='text-typography-500'>
                  No {title.toLowerCase()} yet
                </Text>
              </VStack>
            ) : (
              <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={true}
              >
                <VStack className='gap-0'>
                  {users.map(user => (
                    <View key={user.id}>{renderUser({ item: user })}</View>
                  ))}
                </VStack>
              </ScrollView>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
