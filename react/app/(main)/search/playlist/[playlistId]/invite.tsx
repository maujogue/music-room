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
import { useAppToast } from '@/hooks/useAppToast';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';

export default function Invite() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const toast = useAppToast();

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
        toast.show({
          title: 'User invited successfully',
          description: `${selectedUser.username} has been invited as ${role}.`,
        });
        handleClose();
      } catch (error: any) {
        if (error?.status === 409) {
          toast.error({
            title: 'Already a member',
            description: `${selectedUser.username} is already a member of this playlist.`,
          });
        } else {
          toast.error({ title: 'Invitation failed' });
        }
        handleClose();
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
            <VStack space='md' className='items-stretch'>
              <Box
                className='mb-2 p-3 rounded-lg'
                style={{ backgroundColor: '#E8F5E9' }}
              >
                <Text className='font-medium mb-1'>
                  As{' '}
                  <Text className='font-semibold' style={{ color: '#4CAF50' }}>
                    Member
                  </Text>
                </Text>
                <Text className=' text-sm mb-2'>
                  {selectedUser?.username || 'this user'} will only be able to{' '}
                  <Text className='font-semibold'>view</Text> the playlist.
                </Text>
                <Button
                  size='sm'
                  variant='solid'
                  className='w-full'
                  style={{ backgroundColor: '#4CAF50' }}
                  onPress={() => handleConfirmInvite('member')}
                >
                  <ButtonText className='text-white'>
                    Invite as Member
                  </ButtonText>
                </Button>
              </Box>
              <Box
                className='p-3 rounded-lg'
                style={{ backgroundColor: '#E3F2FD' }}
              >
                <Text className='font-medium mb-1'>
                  As{' '}
                  <Text className='font-semibold' style={{ color: '#2196F3' }}>
                    Collaborator
                  </Text>
                </Text>
                <Text className='text-sm mb-2'>
                  {selectedUser?.username || 'this user'} will be able to{' '}
                  <Text className='font-semibold'>edit</Text> the playlist and
                  add or remove items.
                </Text>
                <Button
                  size='sm'
                  variant='solid'
                  className='w-full'
                  style={{ backgroundColor: '#2196F3' }}
                  onPress={() => handleConfirmInvite('collaborator')}
                >
                  <ButtonText className='text-white'>
                    Invite as Collaborator
                  </ButtonText>
                </Button>
              </Box>
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
