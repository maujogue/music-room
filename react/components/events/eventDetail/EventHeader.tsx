import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/ui/icon';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import LikeButton from '@/components/generics/LikeButton';
import EventLocationInfo from '@/components/events/eventDetail/EventLocationInfos';
import EventDatesInfos from './Dates/EventDatesInfos';
import EventMembersDrawer from '@/components/events/EventMembersDrawer';
import { useState } from 'react';
import { addUserToEvent, removeUserFromEvent } from '@/services/events';
import { Box } from '@/components/ui/box';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, BadgeIcon } from '@/components/ui/badge';
import EventAllBadges from '@/components/generics/EventAllBadges';

interface Props {
  eventData: MusicEventFetchResult;
  expanded: boolean;
  onToggle: () => void;
  onRefresh?: () => void;
}

const COMPACT_H = 200;
const EXPANDED_H = 285;

export default function EventHeader({
  eventData,
  expanded,
  onToggle,
  onRefresh,
}: Props) {
  const [eventLiked, setEventLiked] = useState(!!eventData.user?.role);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [image] = useState(
    eventData.event.image_url || 'https://picsum.photos/111'
  );

  const handleCloseMembersDrawer = () => {
    setShowMembersDrawer(false);
  };

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0);
  }, [expanded]);

  const progress = useSharedValue(expanded ? 1 : 0);

  const containerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      progress.value,
      [0, 1],
      [COMPACT_H, EXPANDED_H],
      Extrapolation.CLAMP
    );
    return { height: height, overflow: 'hidden' };
  });

  const extraStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(expanded ? 1 : 0, { duration: 200 }),
    };
  });

  const chevronStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(expanded ? 1 : 0.5, { duration: 200 }),
    };
  });

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
    <Animated.View style={containerStyle} className='bg-primary-500'>
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
                      <HStack className='gap-2 ml-2 items-center'>
                        <Button
                          variant='link'
                          onPress={onToggle}
                          accessibilityRole='button'
                        >
                          <Animated.View style={chevronStyle}>
                            <Badge
                              size='md'
                              className='rounded-xl bg-white/20 backdrop-blur-sm'
                            >
                              <BadgeIcon
                                size='md'
                                as={expanded ? ChevronDownIcon : ChevronUpIcon}
                                className='text-white'
                              />
                            </Badge>
                          </Animated.View>
                        </Button>
                      </HStack>
                    </HStack>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </VStack>

        {/* Expanded CONTENT */}
        <Animated.View style={extraStyle}>
          <HStack className='justify-between items-top pt-4 pb-2 px-2'>
            <EventLocationInfo location={eventData.location} />
            <EventDatesInfos
              event={eventData.event}
              coordinates={eventData.location?.coordinates}
            />
          </HStack>
        </Animated.View>
      </Card>

      {/* Event Members Drawer */}
      <EventMembersDrawer
        eventData={eventData}
        isOpen={showMembersDrawer}
        onClose={handleCloseMembersDrawer}
        onUpdated={onRefresh}
      />
    </Animated.View>
  );
}
