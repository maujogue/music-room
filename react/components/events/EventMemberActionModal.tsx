import React from 'react';
import { Modal, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { DrawerBackdrop } from '@/components/ui/drawer';
import { Heading } from '@/components/ui/heading';
import { Switch } from '@/components/ui/switch';
import { UserMinus } from 'lucide-react-native';

type Props = {
  visible: boolean;
  selectedUser: any | null;
  selectedUserCanInvite: boolean;
  setSelectedUserCanInvite: (v: boolean) => void;
  selectedUserCanVote: boolean;
  setSelectedUserCanVote: (v: boolean) => void;
  onSave: () => void;
  onRemove: () => void;
  onCancel: () => void;
};

export default function EventMemberActionModal({
  visible,
  selectedUser,
  selectedUserCanInvite,
  setSelectedUserCanInvite,
  selectedUserCanVote,
  setSelectedUserCanVote,
  onSave,
  onRemove,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible}>
      <DrawerBackdrop />
      <View className='flex-1 justify-center items-center p-4'>
        <View className='bg-white rounded-lg overflow-hidden shadow-lg w-11/12 max-w-md'>
          <View className='p-4 border-b'>
            <Heading className='text-typography-950 font-semibold' size='md'>
              Actions for {selectedUser?.profile.username}
            </Heading>
          </View>
          <View className='p-4'>
            <Text size='sm' className='mb-4'>
              What action would you like to perform?
            </Text>
          </View>
          <View className='p-4 border-t flex flex-col gap-3'>
            <VStack>
              <HStack className='my-4 items-center'>
                <Switch
                  className='mx-4'
                  value={selectedUserCanInvite}
                  onToggle={() =>
                    setSelectedUserCanInvite(!selectedUserCanInvite)
                  }
                />
                <Text>Can Invite</Text>
              </HStack>
              <HStack className='mb-4 items-center'>
                <Switch
                  className='mx-4'
                  value={selectedUserCanVote}
                  onToggle={() => setSelectedUserCanVote(!selectedUserCanVote)}
                />
                <Text>Can Vote</Text>
              </HStack>
            </VStack>

            <Button variant='solid' className='w-full' onPress={onSave}>
              <ButtonText className='ml-2'>Save Changes</ButtonText>
            </Button>
            <Button
              variant='solid'
              action='negative'
              className='w-full'
              onPress={onRemove}
            >
              <ButtonIcon as={UserMinus} />
              <ButtonText className='ml-2'>Remove from Event</ButtonText>
            </Button>

            <Button variant='outline' className='w-full' onPress={onCancel}>
              <ButtonText>Cancel</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
