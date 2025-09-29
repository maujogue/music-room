import Search from '@/components/search/Search';
import UserListItem from '@/components/profile/UserListItem';
import { useLocalSearchParams } from 'expo-router';
import { addUserToPlaylist } from '@/services/playlist';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogBackdrop,
} from '@/components/ui/alert-dialog';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import React, { useState } from 'react';

export default function Invite() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleUserPress = (user: any) => {
    setSelectedUser(user);
    setShowAlertDialog(true);
  };

  const handleClose = () => {
    setShowAlertDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmInvite = async (role: 'member' | 'collaborator') => {
    if (selectedUser) {
      try {
        await addUserToPlaylist(playlistId, selectedUser.id, role);
        console.log('User invited successfully');
        handleClose();
      } catch (error) {
        console.error('Error inviting user:', error);
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
              Invite {selectedUser?.username} to playlist?
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className='mt-3 mb-4'>
            <Text size='sm'>
              Are you sure you want to invite {selectedUser?.username} to
              collaborate on this playlist?
            </Text>
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
            <Button size='sm' onPress={() => handleConfirmInvite('member')}>
              <ButtonText>Invite as Member</ButtonText>
            </Button>
            <Button
              size='sm'
              onPress={() => handleConfirmInvite('collaborator')}
            >
              <ButtonText>Invite as Collaborator</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
