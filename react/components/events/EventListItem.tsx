import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { useEventDate } from '@/hooks/useEventDate';
import { LinearGradient } from 'expo-linear-gradient';
import EventAllBadges from '@/components/generics/EventAllBadges';

type Props = {
  event: MusicEvent;
  owner: UserInfo;
};

export default function EventListItem({ event, owner }: Props) {
  const router = useRouter();
  const { start } = useEventDate(event.beginning_at);

  const onEventPress = () => {
    router.push({
      pathname: '(main)/events/[eventId]',
      params: { eventId: event.id },
    });
  };

  const getImage = () => {
    return {
      uri: event.image_url ? event.image_url : 'https://picsum.photos/111',
    };
  };

  return (
    <Pressable onPress={() => onEventPress()}>
      <Card size='md' className='rounded-xl mb-2 p-0' variant='elevated'>
        <Box className='relative'>
          <Image
            source={getImage()}
            className='rounded-xl h-[120px] w-full'
            alt='Playlist avatar'
          />
          {/* Gradient overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
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
          <Box className='absolute inset-0 rounded-xl items-start justify-center px-2'>
            <Text className='text-white px-2'>{start.full}</Text>
            <Heading
              size='3xl'
              className='text-white text-start p-2'
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {event.name}
            </Heading>
            <HStack className='w-full justify-between'>
              <HStack className='items-center px-2'>
                <Avatar size='sm'>
                  <AvatarImage
                    source={{
                      uri: owner?.avatar_url
                        ? owner.avatar_url
                        : 'https://picsum.photos/111',
                    }}
                  />
                </Avatar>
                <Text size='sm' className='text-typography-400 px-2'>
                  {owner?.username}
                </Text>
              </HStack>
              <HStack className='items-center gap-2'>
                <EventAllBadges event={event} />
              </HStack>
            </HStack>
          </Box>
        </Box>
      </Card>
    </Pressable>
  );
}
