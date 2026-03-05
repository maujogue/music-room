import FloatButton from '@/components/generics/FloatButton';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { SettingsIcon, TrashIcon, EditIcon } from '@/components/ui/icon';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/drawer';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { useState } from 'react';
import EventLocationInfo from '@/components/events/eventDetail/EventLocationInfos';
import EventDatesInfos from './Dates/EventDatesInfos';
import ConfirmModal from '@/components/generics/ConfirmModal';
import { useEvent } from '@/hooks/useEvent';
import { useRouter } from 'expo-router';
import { Star, StarOff, Info } from 'lucide-react-native';

interface Props {
  callDelete: () => void;
  callEdit: () => void;
  eventData: MusicEventFetchResult;
  isOwner?: boolean;
  className?: string;
  style?: any;
}

export default function Event3DotMenu({
  callDelete,
  callEdit,
  eventData,
  isOwner = false,
  className,
  style,
}: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [startModal, setStartModal] = useState(false);
  const [stopModal, setStopModal] = useState(false);
  const router = useRouter();
  const { startEvent, stopEvent } = useEvent(eventData.event.id);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleDelete = () => {
    callDelete();
    handleCloseDrawer();
  };

  const handleEdit = () => {
    callEdit();
    handleCloseDrawer();
  };

  function isInProgress(event: MusicEvent) {
    if (event.done) {
      return false;
    }
    const eventDate = new Date(event.beginning_at);
    const now = new Date();
    return now > eventDate;
  }

  function isDone(event: MusicEvent) {
    return event.done;
  }

  const showStart = () => {
    return (
      isOwner && (isDone(eventData.event) || !isInProgress(eventData.event))
    );
  };

  const showStop = () => {
    return isOwner && isInProgress(eventData.event);
  };

  async function submitStartEvent() {
    try {
      await startEvent(eventData.event.id);
    } catch {
      // Ignore errors
    }
    reload();
  }

  async function submitStopEvent() {
    try {
      await stopEvent(eventData.event.id);
    } catch {
      // Ignore errors
    }
    reload();
  }

  function reload() {
    router.replace(`/(main)/events/${eventData.event.id}`);
  }

  return (
    <>
      <FloatButton
        onPress={handleOpenDrawer}
        icon={isOwner ? SettingsIcon : Info}
        className={className}
        style={style}
      />

      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer}>
        <DrawerBackdrop />
        <DrawerContent className='w-full max-h-[70vh]'>
          <DrawerHeader>
            <Text size='lg' className='font-semibold text-center'>
              Event Options
            </Text>
          </DrawerHeader>

          <DrawerBody className='gap-2 pb-4'>
            <VStack className='bg-background-50 p-4 rounded-xl gap-3 mb-2'>
              <EventDatesInfos event={eventData.event} />
              <Divider />
              <EventLocationInfo location={eventData.location} />
              <Divider />
              <HStack className='justify-between items-center'>
                <Text className='font-semibold'>Visibility</Text>
                <Text>{eventData.event.is_private ? 'Private' : 'Public'}</Text>
              </HStack>
              <HStack className='justify-between items-center'>
                <Text className='font-semibold'>Type</Text>
                <Text>
                  {eventData.event.everyone_can_vote
                    ? 'Collaborative'
                    : 'Not Collaborative'}
                </Text>
              </HStack>
            </VStack>

            <VStack className='gap-2'>
              {/* Start Event Button */}
              {isOwner && showStart() && (
                <Button
                  variant='link'
                  className='w-full justify-start'
                  onPress={() => {
                    handleCloseDrawer();
                    setStartModal(true);
                  }}
                >
                  <HStack className='items-center gap-3'>
                    <ButtonIcon as={Star} />
                    <ButtonText>Start Event</ButtonText>
                  </HStack>
                </Button>
              )}

              {/* Stop Event Button */}
              {isOwner && showStop() && (
                <Button
                  variant='link'
                  action='negative'
                  className='w-full justify-start'
                  onPress={() => {
                    handleCloseDrawer();
                    setStopModal(true);
                  }}
                >
                  <HStack className='items-center gap-3'>
                    <ButtonIcon as={StarOff} />
                    <ButtonText>Stop Event</ButtonText>
                  </HStack>
                </Button>
              )}

              {/* Delete Button */}
              {isOwner && (
                <Button
                  variant='link'
                  action='negative'
                  className='w-full justify-start'
                  onPress={handleDelete}
                >
                  <HStack className='items-center gap-3'>
                    <ButtonIcon as={TrashIcon} />
                    <ButtonText>Delete Event</ButtonText>
                  </HStack>
                </Button>
              )}

              {/* Edit Button */}
              {isOwner && (
                <Button
                  variant='link'
                  className='w-full justify-start'
                  onPress={handleEdit}
                >
                  <HStack className='items-center justify-between w-full'>
                    <HStack className='items-center gap-3'>
                      <ButtonIcon as={EditIcon} />
                      <ButtonText>Edit Event</ButtonText>
                    </HStack>
                  </HStack>
                </Button>
              )}

              <Divider className='my-2' />

              {/* Cancel Button */}
              <Button
                variant='solid'
                action='secondary'
                className='w-full mt-4'
                onPress={handleCloseDrawer}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <ConfirmModal
        isOpen={startModal}
        setIsOpen={setStartModal}
        title='Start the event?'
        description="If everything is ready, let's get the event started."
        confirmText='Start'
        confirmIcon={Star}
        onConfirm={submitStartEvent}
      />

      <ConfirmModal
        isOpen={stopModal}
        setIsOpen={setStopModal}
        title='Stop the event?'
        description='No more things to eat or drink ? Music getting weird ?'
        confirmText='Stop'
        destructive
        confirmIcon={StarOff}
        onConfirm={submitStopEvent}
      />
    </>
  );
}
