import Search from '@/components/search/Search';
import UserListItem from '@/components/profile/UserListItem';
import { useLocalSearchParams } from 'expo-router';
import { addUserToEvent } from '@/services/events';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogBackdrop,
  AlertDialogCloseButton,
} from '@/components/ui/alert-dialog';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import React, { useState } from 'react';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { useAppToast } from '@/hooks/useAppToast';



export default function Invite() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [can_invite, setCanInvite] = useState(true);
  const [can_vote, setCanVote] = useState(true);
  const toast = useAppToast();

  const handleUserPress = (user: any) => {
    setSelectedUser(user);
    setShowAlertDialog(true);
  };

  const handleClose = () => {
    setShowAlertDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmInvite = async () => {
    if (selectedUser) {
      try {
        const role =
          can_invite && can_vote
            ? 'collaborator'
            : can_invite
              ? 'inviter'
              : can_vote
                ? 'voter'
                : 'member';
        await addUserToEvent(eventId, selectedUser.id, role);
        console.log('User invited successfully');
        toast.show({
          title: 'User invited successfully',
          description :`${selectedUser.username} has been invited as ${role}.`}
        );
        handleClose();
      } catch (error) {
        console.error('Error inviting user:', error);
        toast.error({title : 'Invitation failed'});
      }
    }
  };

  return (
    <>
      <Search
        placeholder='Search for users to invite to your playlist...'
        showFilters={false}
        defaultType='Users'
        renderItemUser={(item: any) => (
          <UserListItem
            user={item}
            key={item.id}
            showActionButtons={false}
            onUserPress={() => handleUserPress(item)}
          />
        )}
      />

      <AlertDialog isOpen={showAlertDialog} onClose={handleClose} size='md'>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading className='text-typography-950 font-semibold' size='md'>
              Invite {selectedUser?.username} to event?
            </Heading>
          </AlertDialogHeader>
          <AlertDialogCloseButton >
            <Icon as={CloseIcon} size="md" />
          </AlertDialogCloseButton>
          <AlertDialogBody className='mt-3 mb-4'>
            <Text size='sm'>
              Are you sure you want to invite {selectedUser?.username} to
              collaborate on this event?
            </Text>
            <VStack>
              <HStack className='my-4 items-center'>
                <Switch
                  className='mx-4'
                  value={can_invite}
                  onToggle={() => setCanInvite(!can_invite)}
                />
                <Text>Can Invite</Text>
              </HStack>
              <HStack className='mb-4 items-center'>
                <Switch
                  className='mx-4'
                  value={can_vote}
                  onToggle={() => setCanVote(!can_vote)}
                />
                <Text>Can Vote</Text>
              </HStack>
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant='outline'
              action='secondary'
              onPress={handleClose}
              size='sm'
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button size='sm' onPress={() => handleConfirmInvite()}>
              <ButtonText>Invite</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
