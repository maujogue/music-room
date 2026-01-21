import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import {
  UserRoundPlus,
  MoreVertical,
  Key,
  UserMinus,
} from 'lucide-react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { ScrollView, Modal, View, SafeAreaView } from 'react-native';
import { addUserToPlaylist } from '@/services/playlist';
import { removeUserFromPlaylist } from '@/services/playlist';
import { useState } from 'react';
import { Heading } from '@/components/ui/heading';

type Props = {
  playlist: Playlist;
  onBack: () => void;
  onInvitePress: () => void;
  onUpdated?: () => void;
};

export default function PlaylistMembersView({
  playlist,
  onInvitePress,
  onUpdated,
}: Props) {
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    username: string;
    role: 'member' | 'collaborator';
  } | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);

  const handleAddToCollaboratorsPress = async (userId: string) => {
    try {
      await addUserToPlaylist(playlist.id, userId, 'collaborator');
      onUpdated?.();
      setShowActionDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to add user to collaborators:', error);
    }
  };

  const handleUserActionPress = (
    user: { id: string; username: string },
    role: 'member' | 'collaborator'
  ) => {
    setSelectedUser({ ...user, role });
    setShowActionDialog(true);
  };

  const handleRemoveFromPlaylist = async () => {
    if (!selectedUser) return;
    try {
      await removeUserFromPlaylist(playlist.id, selectedUser.id);
      onUpdated?.();
      setShowActionDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to remove user from playlist:', error);
    }
  };

  const handleDemoteToMember = async () => {
    if (!selectedUser) return;
    try {
      await removeUserFromPlaylist(playlist.id, selectedUser.id);
      await addUserToPlaylist(playlist.id, selectedUser.id, 'member');
      onUpdated?.();
      setShowActionDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to demote user to member:', error);
    }
  };

  const handleCloseActionDialog = () => {
    setShowActionDialog(false);
    setSelectedUser(null);
  };

  const filteredCollaborators =
    playlist.collaborators?.filter(collab => collab.id !== playlist.owner.id) ||
    [];

  const collaboratorIds = filteredCollaborators.map(collab => collab.id) || [];
  const filteredMembers =
    playlist.members?.filter(
      member =>
        !collaboratorIds.includes(member.id) && member.id !== playlist.owner.id
    ) || [];

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView className='flex-1 p-4'>
        <VStack className='gap-4'>
          {/* Owner */}
          <VStack className='gap-2'>
            <HStack>
              <Text size='sm' className='font-medium text-gray-600'>
                Owner
              </Text>
              <Button
                size='sm'
                variant='outline'
                className='ml-auto rounded-full p-2'
                onPress={onInvitePress}
              >
                <ButtonIcon as={UserRoundPlus} />
              </Button>
            </HStack>
            <HStack className='items-center gap-3 p-2 bg-gray-50 rounded-lg'>
              <Avatar size='md'>
                <AvatarFallbackText>
                  {playlist.owner.username?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallbackText>
                {playlist.owner.avatar_url && (
                  <AvatarImage source={{ uri: playlist.owner.avatar_url }} />
                )}
              </Avatar>
              <VStack>
                <Text size='md' className='font-medium'>
                  {playlist.owner.username}
                </Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Collaborators */}
          {filteredCollaborators && filteredCollaborators.length > 0 && (
            <>
              <Divider className='my-2' />
              <VStack className='gap-2'>
                <Text size='sm' className='font-medium text-gray-600'>
                  Collaborators ({filteredCollaborators.length})
                </Text>
                {filteredCollaborators.map((collaborator, index) => (
                  <HStack
                    key={index}
                    className='items-center gap-3 p-2 rounded-lg'
                  >
                    <Avatar size='md'>
                      <AvatarFallbackText>
                        {collaborator.username?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallbackText>
                      {collaborator.avatar_url && (
                        <AvatarImage
                          source={{ uri: collaborator.avatar_url }}
                        />
                      )}
                    </Avatar>
                    <VStack className='flex-1'>
                      <Text size='md' className='font-medium'>
                        {collaborator.username}
                      </Text>
                    </VStack>
                    {playlist.user.role === 'owner' && (
                      <Button
                        size='sm'
                        className='rounded-full p-3 w-10 h-10'
                        variant='outline'
                        onPress={() =>
                          handleUserActionPress(collaborator, 'collaborator')
                        }
                      >
                        <ButtonIcon as={MoreVertical} />
                      </Button>
                    )}
                  </HStack>
                ))}
              </VStack>
            </>
          )}

          {/* Members */}
          {filteredMembers && filteredMembers.length > 0 && (
            <>
              <Divider className='my-2' />
              <VStack className='gap-2'>
                <Text size='sm' className='font-medium text-gray-600'>
                  Members ({filteredMembers.length})
                </Text>
                {filteredMembers.map((member, index) => (
                  <HStack
                    key={index}
                    className='items-center gap-3 p-2 rounded-lg'
                  >
                    <Avatar size='md'>
                      <AvatarFallbackText>
                        {member.username?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallbackText>
                      {member.avatar_url && (
                        <AvatarImage source={{ uri: member.avatar_url }} />
                      )}
                    </Avatar>
                    <VStack className='flex-1'>
                      <Text size='md' className='font-medium'>
                        {member.username}
                      </Text>
                    </VStack>
                    {playlist.user.role === 'owner' && (
                      <Button
                        size='sm'
                        className='rounded-full p-3 w-10 h-10'
                        variant='outline'
                        onPress={() => handleUserActionPress(member, 'member')}
                      >
                        <ButtonIcon as={MoreVertical} />
                      </Button>
                    )}
                  </HStack>
                ))}
              </VStack>
            </>
          )}

          {/* No members message */}
          {(!filteredCollaborators || filteredCollaborators.length === 0) &&
            (!filteredMembers || filteredMembers.length === 0) && (
              <>
                <Divider className='my-2' />
                <Text className='text-center text-gray-500 p-4'>
                  No collaborators or members yet. Invite people to collaborate!
                </Text>
              </>
            )}
        </VStack>
      </ScrollView>

      {/* Action Modal */}
      <Modal transparent visible={showActionDialog} animationType='fade'>
        <View className='flex-1 justify-center items-center p-4 bg-black/50'>
          <View className='bg-white rounded-lg overflow-hidden shadow-lg w-11/12 max-w-md'>
            <View className='p-4'>
              <Heading className='text-typography-950 font-semibold' size='md'>
                Actions for {selectedUser?.username}
              </Heading>
            </View>
            <View className='px-4 pb-4 flex flex-col gap-3'>
              {selectedUser?.role === 'collaborator' && (
                <Button
                  variant='outline'
                  className='w-full'
                  onPress={handleDemoteToMember}
                >
                  <ButtonIcon as={UserMinus} />
                  <ButtonText className='ml-2'>Demote to Member</ButtonText>
                </Button>
              )}
              {selectedUser?.role === 'member' && (
                <Button
                  variant='solid'
                  className='w-full'
                  onPress={() => handleAddToCollaboratorsPress(selectedUser.id)}
                >
                  <ButtonIcon as={Key} color='white' />
                  <ButtonText className='ml-2 text-white'>
                    Add to Collaborators
                  </ButtonText>
                </Button>
              )}

              <Button
                variant='solid'
                action='negative'
                className='w-full'
                onPress={handleRemoveFromPlaylist}
              >
                <ButtonIcon as={UserMinus} />
                <ButtonText className='ml-2'>Remove from Playlist</ButtonText>
              </Button>

              <Button
                variant='outline'
                className='w-full'
                onPress={handleCloseActionDialog}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
