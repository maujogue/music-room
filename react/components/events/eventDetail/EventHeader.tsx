import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonIcon } from '@/components/ui/button';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CloseCircleIcon,
} from '@/components/ui/icon';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { CircleIcon } from '@/components/ui/icon';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import LikeButton from '@/components/generics/LikeButton';
import { UserRoundPlus } from 'lucide-react-native';
import EventLocationInfo from '@/components/events/eventDetail/EventLocationInfos';
import EventDatesInfos from './Dates/EventDatesInfos';
import { AvatarGroup } from '@/components/generics/AvatarGroup';
import EventMembersDrawer from '@/components/events/EventMembersDrawer';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { addUserToEvent, removeUserFromEvent } from '@/services/events';
interface Props {
  eventData: MusicEventFetchResult;
  expanded: boolean;
  onToggle: () => void;
  onRefresh?: () => void;
}

const COMPACT_H = 200;
const EXPANDED_H = 330;

export default function EventHeader({
  eventData,
  expanded,
  onToggle,
  onRefresh,
}: Props) {
  console.log('EventData in EventHeader:', eventData);
  const router = useRouter();
  const [eventLiked, setEventLiked] = useState(!!eventData.user.role);
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
    if (eventData.user.role) {
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
    <Animated.View style={containerStyle} className='bg-indigo-100'>
      <Card className='p-0 rounded-lg bg-transparent' variant='elevated'>
        <VStack className='relative'>
          <Image
            source={image}
            className='w-full h-[200px]'
            alt='Event image'
          />

          {/* Overlay avec gradient pour lisibilité */}
          <VStack className='absolute bottom-0 left-0 right-0 p-4'>
            <HStack className='justify-between items-end mb-2'>
              <VStack className='flex-1'>
                <Heading size='4xl' className='font-bold'>
                  {eventData.event.name}
                </Heading>
                {eventData.event.owner?.display_name && (
                  <Text size='sm' className='text-gray-200'>
                    By {eventData.event.owner.display_name}
                  </Text>
                )}
                {eventData.user.role != 'owner' && (
                  <LikeButton isLiked={eventLiked} onPress={handleLikePress} />
                )}
              </VStack>

              <HStack className='gap-2 items-center'>
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
          </VStack>
        </VStack>

        {/* Expanded CONTENT */}
        <Animated.View style={extraStyle} className='mt-2'>
          <HStack className='justify-between items-top px-2'>
            <EventLocationInfo location={eventData.location} />
            <EventDatesInfos event={eventData.event} />
            <Badge
              size='sm'
              action={eventData.event.isPublic ? 'info' : 'warning'}
              className='rounded-full h-6 bg-black/20 backdrop-blur-sm'
            >
              <BadgeIcon
                size='md'
                as={eventData.event.isPublic ? CircleIcon : CloseCircleIcon}
              />
              <BadgeText className='ml-1 text-white'>
                {eventData.event.isPublic ? 'Public' : 'Private'}
              </BadgeText>
            </Badge>
            {eventData?.user?.can_invite && (
              <Button
                size='lg'
                className='rounded-full p-3.5 w-10'
                variant='outline'
                onPress={handleInviteUserPress}
              >
                <ButtonIcon as={UserRoundPlus} size='sm' />
              </Button>
            )}
            <AvatarGroup
              users={eventData.members.map(member => member.profile)}
              onPress={handleMemberAvatarGroupPress}
            />
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
