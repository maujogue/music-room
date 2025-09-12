import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon, CloseCircleIcon } from '@/components/ui/icon';
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
import EventLocationInfo from '@/components/events/eventDetail/EventLocationInfos';
import EventDatesInfos from './Dates/EventDatesInfos';

interface Props {
  eventData: MusicEventFetchResult;
  expanded: boolean;
  onToggle: () => void;
}

const COMPACT_H = 80;
const EXPANDED_H = 210;

export default function EventHeader({ eventData, expanded, onToggle }: Props) {

  const getImage = () => {
    const hasValidImage =
      Array.isArray(eventData.event.images) &&
      eventData.event.images.length > 0 &&
      eventData.event.images[0]?.url;

    return {
      uri: hasValidImage
        ? eventData.event.images[0]!.url
        : 'https://picsum.photos/111',
    };
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

  return (
    <Animated.View style={containerStyle} className='bg-indigo-100'>
      <Card className='rounded-lg bg-transparent gap-2' variant='elevated'>
        <HStack className='gap-2 items-top'>
          <Image
            source={getImage()}
            className='rounded-md h-[60px] w-[60px]'
            alt='Playlist avatar'
          />
          <VStack className='flex-1'>
            <HStack className='justify-between items-center'>
              <Heading size='md' className='text-typography-800'>{eventData.event.name}</Heading>
              <Badge size='sm' action={eventData.event.isPublic ? "info" : "warning"} className="rounded-full h-6">
                <BadgeIcon size="md" as={eventData.event.isPublic ? CircleIcon : CloseCircleIcon} />
                <BadgeText className='ml-1'>{eventData.event.isPublic ? "Public" : "Private"}</BadgeText>
              </Badge>
              <Button
                variant='link'
                onPress={onToggle}
                accessibilityRole='button'
              >
                <Animated.View style={chevronStyle}>
                  <Badge size='md' className='rounded-xl bg-indigo-200'>
                    <BadgeIcon
                      size='md'
                      as={expanded ? ChevronDownIcon : ChevronUpIcon}
                    />
                  </Badge>
                  {/* <Icon as={expanded ? ChevronDownIcon : ChevronUpIcon} size="sm" /> */}
                </Animated.View>
              </Button>
            </HStack>
            {eventData.event.owner?.display_name && (
              <Text size='sm' className="text-typography-400">By {eventData.event.owner.display_name}</Text>
            )}
          </VStack>
        </HStack>

        {/* Expanded CONTENT */}
        <Animated.View style={extraStyle} className="mt-2">
          <HStack className='justify-between items-top' >
            <EventLocationInfo location={eventData.location} />
            <EventDatesInfos event={eventData.event} />
          </HStack>
        </Animated.View>
      </Card>
    </Animated.View>
  );
}
