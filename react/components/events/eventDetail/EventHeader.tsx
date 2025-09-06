import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon, CloseCircleIcon, Icon } from '@/components/ui/icon';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { CircleIcon } from '@/components/ui/icon';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

interface Props {
  event: MusicEvent;
  expanded: boolean;
  onToggle: () => void;
}

const COMPACT_H = 80;
const EXPANDED_H = 200;

export default function EventHeader({ event, expanded, onToggle }: Props) {

  const getImage = () => {
    const hasValidImage =
      Array.isArray(event.images) &&
      event.images.length > 0 &&
      event.images[0]?.url;

    return {
      uri: hasValidImage
        ? event.images[0]!.url
        : 'https://picsum.photos/111',
    };
  };

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0)
  }, [expanded])

  const progress = useSharedValue(expanded ? 1 : 0);

  const containerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      progress.value,
      [0, 1],
      [COMPACT_H, EXPANDED_H],
      Extrapolation.CLAMP
    )
    return { height: height, overflow: 'hidden' };
  })

  const extraStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(expanded ? 1 : 0, { duration: 200 })
    }
  })

  const chevronStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(expanded ? 1 : 0.3, { duration: 200 })
    }
  })

  return (
    <Animated.View style={containerStyle} className="bg-indigo-100">
      <Card className="rounded-lg bg-transparent gap-2" variant="elevated">
        <HStack className="gap-2 ">
          <Image source={getImage()} className="rounded-md h-[60px] w-[60px]" alt="Playlist avatar" />
          <VStack className="pt-1 flex-1">
            <HStack className='justify-between'>
              <Heading size='md' className='text-typography-800'>{event.name}</Heading>
              <Badge size='sm' action={event.isPublic ? "info" : "warning"} className="rounded-full h-6">
                <BadgeIcon size="md" as={event.isPublic ? CircleIcon : CloseCircleIcon} />
                <BadgeText className='ml-1'>{event.isPublic ? "Public" : "Private"}</BadgeText>
              </Badge>
              <Button variant="link" onPress={onToggle} accessibilityRole='button' >
                <Animated.View style={chevronStyle}>
                  <Icon as={expanded ? ChevronDownIcon : ChevronUpIcon} size="sm" />
                </Animated.View>
              </Button>
            </HStack>
            {event.owner?.display_name && (
              <Text size='sm' className="text-typography-400">By {event.owner.display_name}</Text>
            )}
          </VStack>
        </HStack>

        {/* Expanded CONTENT */}
        <Animated.View style={extraStyle} className="bg-lime-200 h-20">
          <HStack className="gap-2 ">
            



          </HStack>
        </Animated.View>

      </Card>
    </Animated.View>
  )
}
