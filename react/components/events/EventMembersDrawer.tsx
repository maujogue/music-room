import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { MusicEventFetchResult } from '@/types/event';
import {
  UserRoundPlus,
  MoreVertical,
  UserCheck,
  UserMinus,
} from 'lucide-react-native';
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
import { addUserToEvent, removeUserFromEvent } from '@/services/events';
import { useState } from 'react';
import { Heading } from '@/components/ui/heading';

type Props = {
  eventData: MusicEventFetchResult;
  isOpen: boolean;
  onClose: () => void;
  onInvitePress: () => void;
  onUpdated?: () => void;
};

export default function EventMembersDrawer({
  eventData,
  isOpen,
  onClose,
  onInvitePress,
  onUpdated,
}: Props) {
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    username: string;
    role: 'attendee' | 'organizer';
  } | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);

  const handlePromoteToOrganizer = async (userId: string) => {
    try {
      await addUserToEvent(eventData.event.id, userId, 'organizer');
      onUpdated?.();
    } catch (error) {
      console.error('Failed to promote user to organizer:', error);
    }
  };

  const handleUserActionPress = (
    user: { id: string; username: string },
    role: 'attendee' | 'organizer'
  ) => {
    setSelectedUser({ ...user, role });
    setShowActionDialog(true);
  };

  const handleRemoveFromEvent = async () => {
    if (!selectedUser) return;
    try {
      await removeUserFromEvent(eventData.event.id, selectedUser.id);
      onUpdated?.();
      setShowActionDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to remove user from event:', error);
    }
  };

  const handleDemoteToAttendee = async () => {
    if (!selectedUser) return;
    try {
      await removeUserFromEvent(eventData.event.id, selectedUser.id);
      await addUserToEvent(eventData.event.id, selectedUser.id, 'attendee');
      onUpdated?.();
      setShowActionDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to demote user to attendee:', error);
    }
  };

  const handleCloseActionDialog = () => {
    setShowActionDialog(false);
    setSelectedUser(null);
  };

  const filteredOrganizers =
    eventData.organizers?.filter(
      organizer => organizer.id !== eventData.event.owner.id
    ) || [];

  const organizerIds = filteredOrganizers.map(organizer => organizer.id) || [];
  const filteredAttendees =
    eventData.members?.filter(
      member =>
        !organizerIds.includes(member.profile.id) &&
        member.profile.id !== eventData.event.owner_id
    ) || [];

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose}>
        <DrawerBackdrop />
        <DrawerContent className='w-full max-h-[70vh]'>
          <ScrollView className='flex-1'>
            <DrawerHeader>
              <HStack className='items-center'>
                <Text size='lg' className='font-semibold flex-1 text-left'>
                  Event Participants
                </Text>
                {eventData.event.user?.can_invite && (
                  <Button
                    size='lg'
                    className='rounded-full p-3.5 w-10'
                    variant='outline'
                    onPress={onInvitePress}
                  >
                    <ButtonIcon as={UserRoundPlus} size='sm' />
                  </Button>
                )}
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
                <HStack className='items-center gap-3 p-2 bg-gray-50 rounded-lg'>
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
                        {eventData.event.user?.role === 'owner' && (
                          <HStack className='ml-auto gap-2'>
                            <Button
                              size='sm'
                              className='rounded-full'
                              variant='outline'
                              onPress={() =>
                                handleUserActionPress(
                                  {
                                    id: member.id,
                                    username:
                                      member.profile.username || 'Unknown',
                                  },
                                  'attendee'
                                )
                              }
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
          <View className='flex-1 justify-center items-center p-4'>
            <View className='bg-white rounded-lg overflow-hidden shadow-lg w-11/12 max-w-md'>
              <View className='p-4 border-b'>
                <Heading
                  className='text-typography-950 font-semibold'
                  size='md'
                >
                  Actions for {selectedUser?.username}
                </Heading>
              </View>
              <View className='p-4'>
                <Text size='sm' className='mb-4'>
                  What action would you like to perform?
                </Text>
              </View>
              <View className='p-4 border-t flex flex-col gap-3'>
                {selectedUser?.role === 'organizer' && (
                  <Button
                    variant='outline'
                    className='w-full'
                    onPress={handleDemoteToAttendee}
                  >
                    <ButtonIcon as={UserMinus} />
                    <ButtonText className='ml-2'>Demote to Attendee</ButtonText>
                  </Button>
                )}
                {selectedUser?.role === 'attendee' && (
                  <Button
                    size='sm'
                    variant='filled'
                    className='w-full'
                    onPress={() => handlePromoteToOrganizer(selectedUser.id)}
                  >
                    <ButtonIcon as={UserCheck} color='white' />
                    <ButtonText className='ml-2 text-white'>
                      Promote to Organizer
                    </ButtonText>
                  </Button>
                )}

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
