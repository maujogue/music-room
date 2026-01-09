import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { useState } from 'react';
import LikeButton from '@/components/generics/LikeButton';
import EventMembersDrawer from '@/components/events/EventMembersDrawer';
import { addUserToEvent, removeUserFromEvent } from '@/services/events';
import { Box } from '@/components/ui/box';
import { LinearGradient } from 'expo-linear-gradient';
import EventAllBadges from '@/components/generics/EventAllBadges';
import { getRandomImage } from '@/utils/randomImage';

interface Props {
  eventData: MusicEventFetchResult;
  onRefresh?: () => void;
}

export default function EventHeader({ eventData, onRefresh }: Props) {
  const [eventLiked, setEventLiked] = useState(!!eventData.user?.role);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [image] = useState(
    eventData.event.image_url
      ? { uri: eventData.event.image_url }
      : getRandomImage()
  );
  console.log('eventData.event.image_url', eventData.event.image_url);

  const handleCloseMembersDrawer = () => {
    setShowMembersDrawer(false);
  };

  const handleLikePress = () => {
    if (eventData.user?.role) {
      removeUserFromEvent(eventData.event.id, '').then(() => {
        setEventLiked(false);
      });
    } else {
      addUserToEvent(eventData.event.id, '', 'member').then(() => {
        setEventLiked(true);
      });
    }
  };

  return (
    <VStack className='bg-white'>
      <Card className='p-0 rounded-lg bg-transparent' variant='elevated'>
        <VStack className='relative'>
          <Image
            source={image}
            className='w-full h-[200px]'
            alt='Event image'
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.4, y: 0 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />
          <VStack className='absolute bottom-0 left-0 right-0 p-4'>
            <HStack className='justify-between items-end mb-2'>
              <VStack className='w-full'>
                <HStack className='h-full px-2 gap-2 items-end justify-between overflow-hidden'>
                  <Heading
                    size='2xl'
                    className='font-bold text-gray-100 max-w-[220px]'
                    numberOfLines={1}
                    isTruncated={true}
                  >
                    {eventData.event.name}
                  </Heading>
                  <HStack className='justify-between px-2 pt-2 items-bottom'>
                    {eventData.user?.role != 'owner' ? (
                      <LikeButton
                        isLiked={eventLiked}
                        onPress={handleLikePress}
                      />
                    ) : (
                      <Box />
                    )}
                    <HStack className='gap-1'>
                      <EventAllBadges event={eventData.event} />
                    </HStack>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </VStack>
      </Card>

      {/* Event Members Drawer */}
      <EventMembersDrawer
        eventData={eventData}
        isOpen={showMembersDrawer}
        onClose={handleCloseMembersDrawer}
        onUpdated={onRefresh}
      />
    </VStack>
  );
}
