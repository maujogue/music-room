import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { CircleIcon } from '@/components/ui/icon';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

type Props = {
  event: MusicEvent;
};

export default function EventListItem({ event }: Props) {
  const router = useRouter();

  const onEventPress = () => {
    router.push({
      pathname: '(main)/events/[eventId]',
      params: { eventId: event.id },
    });
  };

  const getImage = () => {
    const hasValidImage =
      Array.isArray(event.images) &&
      event.images.length > 0 &&
      event.images[0]?.url;

    return {
      uri: hasValidImage ? event.images[0]!.url : 'https://picsum.photos/111',
    };
  };

  return (
    <Pressable onPress={() => onEventPress()}>
      <Card
        size='md'
        className='rounded-lg flex-row gap-2 mb-2 p-2'
        variant='elevated'
      >
        <Image
          source={getImage()}
          className='rounded-md h-[60px] w-[60px]'
          alt='Playlist avatar'
        />
        <VStack className='pt-1 flex-1'>
          <HStack className='justify-between'>
            <Heading size='md' className='text-typography-800'>
              {event.name}
            </Heading>

            {/* BADGES MOCK UP HERE (0% MEANING YET) */}
            <HStack className='gap-2'>
              {event.id.includes('2') && (
                <Badge action='info' className='rounded-full'>
                  <BadgeIcon as={CircleIcon} className='' />
                </Badge>
              )}
              {Number(event.id) % 2 == 0 ? (
                <Badge action='success' className='rounded-full'>
                  <BadgeText>Cool</BadgeText>
                </Badge>
              ) : (
                <Badge action='warning' className='rounded-full'>
                  <BadgeText>Not cool</BadgeText>
                </Badge>
              )}
            </HStack>
            {/* BADGES MOCK UP HERE (0% MEANING YET) */}
          </HStack>
          {event.owner?.display_name && (
            <Text size='sm' className='text-typography-400'>
              By {event.owner.display_name}
            </Text>
          )}
        </VStack>
      </Card>
    </Pressable>
  );
}
