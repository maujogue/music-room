import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from '@/components/ui/icon';
import { Badge, BadgeIcon } from '@/components/ui/badge';
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
import { useRouter } from 'expo-router';
import { addUserToEvent, removeUserFromEvent } from '@/services/events';
import PrivateBadge from '@/components/generics/PrivateBadge';
import CollaborativeBadge from '@/components/generics/CollaborativeBadge';
import { Box } from '@/components/ui/box';
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
  const router = useRouter();
  const [eventLiked, setEventLiked] = useState(!!eventData.user?.role);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [image] = useState(
    eventData.event.image_url || 'https://picsum.photos/111'
  );

  const handleMemberAvatarGroupPress = () => {
    setShowMembersDrawer(true);
  };

  const handleCloseMembersDrawer = () => {
    setShowMembersDrawer(false);
  };

  const handleInviteUserPress = () => {
    router.push(`(main)/events/${eventData.event.id}/invite`);
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
          <VStack className='absolute bottom-0 left-0 right-0 p-4'>
            <HStack className='justify-between items-end mb-2'>
              <VStack className='w-full'>
                <HStack className='rounded-xl px-2 gap-2 items-baseline bg-neutral-300/50 border border-neutral-300 overflow-hidden'>
                  <Heading size='3xl' className='font-bold ' numberOfLines={1} ellipsizeMode="tail">
                    {eventData.event.name}
                  </Heading>
                  {eventData.owner?.username && (
                    <Text size='sm' className='text-neutral-700'>
                      By {eventData.owner.username}
                    </Text>
                  )}
                </HStack>
                <HStack className='justify-between px-2 pt-2 items-bottom'>
                  {eventData.user?.role != 'owner' ? (
                    <LikeButton isLiked={eventLiked} onPress={handleLikePress} />
                  ) : <Box />}
                  <HStack className='gap-1'>
                    {!eventData.event.isPublic && (
                      <PrivateBadge />
                    )}
                    {eventData.event.everyone_can_vote && (
                      <CollaborativeBadge />
                    )}
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
              </VStack>
            </HStack>
          </VStack>
        </VStack>

        {/* Expanded CONTENT */}
        <Animated.View style={extraStyle}>
          <HStack className='justify-between items-top pt-4 pb-2 px-2'>
            <EventLocationInfo location={eventData.location} />
            <EventDatesInfos event={eventData.event} coordinates={eventData.location.coordinates} />
          </HStack>
        </Animated.View>
      </Card>

      {/* Event Members Drawer */}
      <EventMembersDrawer
        eventData={eventData}
        isOpen={showMembersDrawer}
        onClose={handleCloseMembersDrawer}
        onInvitePress={handleInviteUserPress}
        onUpdated={onRefresh}
      />
    </Animated.View>
  );
}
