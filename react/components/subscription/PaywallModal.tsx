import React from 'react';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import { ButtonText } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BadgeText } from '@/components/ui/badge';
import { Divider } from '@/components/ui/divider';
import { Box } from '@/components/ui/box';
import { CheckIcon } from '@/components/ui/icon';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { useSubscription } from '@/contexts/subscriptionCtx';
import { useAppToast } from '@/hooks/useAppToast';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { isPremium, toggleSubscription, isLoading } = useSubscription();
  const toast = useAppToast();

  const handleUpgrade = async () => {
    try {
      const { error } = await toggleSubscription();
      if (error) {
        throw error;
      }

      isPremium
        ? toast.info({
            title: 'Subscription Cancelled',
            description: 'You can upgrade again anytime.',
            duration: 3000,
          })
        : toast.success({
            title: 'Welcome to Premium!',
            description: 'You now have access to all premium features.',
            duration: 3000,
          });

      onClose();
    } catch (error) {
      toast.error({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        duration: 3000,
      });
    }
  };

  const features = [
    { name: 'View Playlists', free: true, premium: true },
    { name: 'Create Playlists', free: false, premium: true },
    { name: 'Edit Playlists', free: false, premium: true },
    { name: 'Delete Playlists', free: false, premium: true },
    { name: 'Add/Remove Tracks', free: false, premium: true },
    { name: 'Invite Collaborators', free: false, premium: true },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <VStack space='sm'>
            <Text className='text-2xl font-bold text-center'>
              {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
            </Text>
            <Text className='text-typography-500 text-center'>
              {isPremium
                ? 'You currently have a premium subscription'
                : 'Unlock all playlist editing features'}
            </Text>
          </VStack>
          <ModalCloseButton>
            <Icon as={CloseIcon} size='md' />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <VStack space='lg'>
            {/* Pricing */}
            <Box className='p-4 rounded-lg'>
              <VStack space='sm' className='items-center'>
                <Text className='text-3xl font-bold text-primary-600'>
                  {isPremium ? 'Premium' : '€25'}
                </Text>
                <Text className='text-typography-600'>
                  {isPremium ? 'Member since' : 'per month'}
                </Text>
              </VStack>
            </Box>

            {/* Features Comparison */}
            <VStack space='md'>
              <Text className='text-lg font-semibold'>Features Comparison</Text>
              <VStack space='sm'>
                {features.map((feature, index) => (
                  <HStack
                    key={index}
                    className='justify-between items-center py-2'
                  >
                    <Text className='flex-1'>{feature.name}</Text>
                    <HStack space='md'>
                      <Badge
                        variant={feature.free ? 'solid' : 'outline'}
                        action={feature.free ? 'success' : 'error'}
                        size='sm'
                      >
                        <BadgeText>Free</BadgeText>
                      </Badge>
                      <Badge
                        variant={feature.premium ? 'solid' : 'outline'}
                        action={feature.premium ? 'success' : 'error'}
                        size='sm'
                      >
                        <BadgeText>Premium</BadgeText>
                      </Badge>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            </VStack>

            <Divider />

            {/* Benefits */}
            <VStack space='sm'>
              <Text className='text-lg font-semibold'>Premium Benefits</Text>
              <VStack space='xs'>
                <HStack space='sm' className='items-start'>
                  <Icon
                    as={CheckIcon}
                    size='sm'
                    className='text-success-500 mt-1'
                  />
                  <Text className='flex-1 text-sm'>
                    Full playlist creation and editing capabilities
                  </Text>
                </HStack>
                <HStack space='sm' className='items-start'>
                  <Icon
                    as={CheckIcon}
                    size='sm'
                    className='text-success-500 mt-1'
                  />
                  <Text className='flex-1 text-sm'>
                    Add and remove tracks from any playlist
                  </Text>
                </HStack>
                <HStack space='sm' className='items-start'>
                  <Icon
                    as={CheckIcon}
                    size='sm'
                    className='text-success-500 mt-1'
                  />
                  <Text className='flex-1 text-sm'>
                    Invite friends to collaborate on playlists
                  </Text>
                </HStack>
                <HStack space='sm' className='items-start'>
                  <Icon
                    as={CheckIcon}
                    size='sm'
                    className='text-success-500 mt-1'
                  />
                  <Text className='flex-1 text-sm'>
                    Delete playlists you no longer need
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack space='md' className='w-full'>
            <Button
              onPress={handleUpgrade}
              className='flex-1'
              isDisabled={isLoading}
              action={isPremium ? 'negative' : 'primary'}
            >
              <ButtonText>
                {isLoading
                  ? 'Processing...'
                  : isPremium
                    ? 'Cancel Subscription'
                    : 'Upgrade to Premium'}
              </ButtonText>
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
