import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { MoreVertical, UserMinus } from 'lucide-react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/drawer';
import { Divider } from '@/components/ui/divider';
import { ScrollView, Modal, View } from 'react-native';
import { removeUserFromEvent, editUserInEvent } from '@/services/events';
import { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Switch } from '@/components/ui/switch';
import { Image } from '@/components/ui/image';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  eventData: MusicEventFetchResult;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function EventMembersDrawer({
  eventData,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const [selectedUser, setSelectedUser] = useState<EventUser | null>(null);
  const [selectedUserCanInvite, setSelectedUserCanInvite] = useState(true);
  const [selectedUserCanVote, setSelectedUserCanVote] = useState(true);
  const [showActionDialog, setShowActionDialog] = useState(false);

  const handleEditUser = async () => {
    try {
      let role: UserRole = 'member';
      if (selectedUserCanInvite && selectedUserCanVote) {
        role = 'collaborator';
      } else if (selectedUserCanInvite) {
        role = 'inviter';
      } else if (selectedUserCanVote) {
        role = 'voter';
      }
      if (selectedUser?.profile.id) {
        await editUserInEvent(
          eventData.event.id,
          selectedUser.profile.id,
          role
        ).then(() => {
          setShowActionDialog(false);
          setSelectedUser(null);
        });
      } else {
        console.error('Selected user profile id is undefined');
      }
    } catch (error) {
      console.error('Failed to promote user to organizer:', error);
    }
  };

  const handleUserActionPress = (user: EventUser) => {
    setSelectedUser(user);
    setSelectedUserCanInvite(
      user.role === 'inviter' || user.role === 'collaborator'
    );
    setSelectedUserCanVote(
      user.role === 'voter' || user.role === 'collaborator'
    );
    setShowActionDialog(true);
  };

  const handleRemoveFromEvent = async () => {
    if (!selectedUser) return;
    try {
      await removeUserFromEvent(eventData.event.id, selectedUser.profile.id);
      setShowActionDialog(false);
      setSelectedUser(null);
      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      console.error('Failed to remove user from event:', error);
    }
  };

  const handleCloseActionDialog = () => {
    setShowActionDialog(false);
    setSelectedUser(null);
  };

  // There is only one owner, so organizers are empty
  const filteredOrganizers: never[] = [];

  const filteredAttendees =
    eventData.members?.filter(
      member => member.profile.id !== eventData.event.owner_id
    ) || [];

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose}>
        <DrawerBackdrop />
        <DrawerContent className='w-full max-h-[70vh]'>
          <ScrollView className='flex-1'>
            <DrawerHeader className='h-35'>
              <HStack className='items-center gap-3'>
                {eventData.event.image_url && (
                  <>
                    <Image
                      source={{ uri: eventData.event.image_url }}
                      className='absolute w-full h-full rounded-lg p-0'
                      alt='Event image'
                    />
                    <LinearGradient
                      colors={[
                        'rgba(0,0,0,0.8)',
                        'rgba(0,0,0,0.4)',
                        'transparent',
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        borderRadius: 12,
                      }}
                    />
                  </>
                )}
                <VStack className='flex-1 p-4'>
                  <Text
                    size='2xl'
                    className='font-semibold text-left text-bold'
                  >
                    {eventData.event.name}
                  </Text>
                </VStack>
              </HStack>
            </DrawerHeader>

            <DrawerBody
              contentContainerClassName='gap-3'
              className='flex-1 overflow-y-auto'
            >
              {/* Owner */}
              <VStack className='gap-2'>
                <Text size='sm' className='font-medium text-gray-600'>
                  Event Creator
                </Text>
                <HStack className='items-center gap-3 p-2 bg-white rounded-lg'>
                  <Avatar size='md'>
                    <AvatarFallbackText>
                      {eventData.owner.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallbackText>
                    {eventData.owner.avatar_url && (
                      <AvatarImage
                        source={{ uri: eventData.owner.avatar_url }}
                      />
                    )}
                  </Avatar>
                  <VStack>
                    <Text size='md' className='font-medium'>
                      {eventData.owner.username || 'Unknown User'}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              {/* Attendees */}
              {filteredAttendees && filteredAttendees.length > 0 && (
                <>
                  <Divider className='my-2' />
                  <VStack className='gap-2'>
                    <Text size='sm' className='font-medium text-gray-600'>
                      Attendees ({filteredAttendees.length})
                    </Text>
                    {filteredAttendees.map((member, index) => (
                      <HStack
                        key={index}
                        className='items-center gap-3 p-2 rounded-lg justify-between'
                      >
                        <HStack className='items-center gap-3'>
                          <Avatar size='md'>
                            <AvatarFallbackText>
                              {member.profile.username
                                ?.charAt(0)
                                .toUpperCase() || 'U'}
                            </AvatarFallbackText>
                            {member.profile.avatar_url && (
                              <AvatarImage
                                source={{ uri: member.profile.avatar_url }}
                              />
                            )}
                          </Avatar>
                          <VStack>
                            <Text size='md' className='font-medium'>
                              {member.profile.username || 'Unknown User'}
                            </Text>
                          </VStack>
                        </HStack>
                        {eventData.user?.role === 'owner' && (
                          <HStack className='ml-auto gap-2'>
                            <Button
                              size='sm'
                              className='rounded-full'
                              variant='outline'
                              onPress={() => handleUserActionPress(member)}
                            >
                              <ButtonIcon as={MoreVertical} />
                            </Button>
                          </HStack>
                        )}
                      </HStack>
                    ))}
                  </VStack>
                </>
              )}

              {/* No participants message */}
              {(!filteredOrganizers || filteredOrganizers.length === 0) &&
                (!filteredAttendees || filteredAttendees.length === 0) && (
                  <>
                    <Divider className='my-2' />
                    <Text className='text-center text-gray-500 p-4'>
                      No participants yet. Invite people to join this event!
                    </Text>
                  </>
                )}
            </DrawerBody>
          </ScrollView>
        </DrawerContent>
      </Drawer>

      {showActionDialog && (
        <Modal transparent visible={showActionDialog} animationType='slide'>
          <DrawerBackdrop />
          <View className='flex-1 justify-center items-center p-4'>
            <View className='bg-white rounded-lg overflow-hidden shadow-lg w-11/12 max-w-md'>
              <View className='p-4 border-b'>
                <Heading
                  className='text-typography-950 font-semibold'
                  size='md'
                >
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
                      onToggle={() =>
                        setSelectedUserCanVote(!selectedUserCanVote)
                      }
                    />
                    <Text>Can Vote</Text>
                  </HStack>
                </VStack>

                <Button
                  variant='solid'
                  className='w-full'
                  onPress={handleEditUser}
                >
                  <ButtonText className='ml-2'>Save Changes</ButtonText>
                </Button>
                <Button
                  variant='solid'
                  action='negative'
                  className='w-full'
                  onPress={handleRemoveFromEvent}
                >
                  <ButtonIcon as={UserMinus} />
                  <ButtonText className='ml-2'>Remove from Event</ButtonText>
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
      )}
    </>
  );
}
