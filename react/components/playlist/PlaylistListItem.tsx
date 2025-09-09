import { SpotifyPlaylist } from '@/types/spotify';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { CircleIcon } from '../ui/icon';

type Props = {
  playlist: SpotifyPlaylist;
};

export default function PlaylistListItem({ playlist }: Props) {
  const getImage = () => {
    const hasValidImage =
      Array.isArray(playlist.images) &&
      playlist.images.length > 0 &&
      playlist.images[0]?.url;

    return {
      uri: hasValidImage
        ? playlist.images[0]!.url
        : 'https://picsum.photos/205',
    };
  };

  return (
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
            {playlist.name}
          </Heading>
          <HStack className='gap-2'>
            {playlist.collaborative && (
              <Badge action='info' className='rounded-full'>
                <BadgeIcon as={CircleIcon} className='' />
              </Badge>
            )}
            {playlist.public ? (
              <Badge action='success' className='rounded-full'>
                <BadgeText>Public</BadgeText>
              </Badge>
            ) : (
              <Badge action='warning' className='rounded-full'>
                <BadgeText>Private</BadgeText>
              </Badge>
            )}
          </HStack>
        </HStack>
        {playlist.owner?.display_name && (
          <Text size='sm' className='text-typography-400'>
            By {playlist.owner.display_name}
          </Text>
        )}
      </VStack>
    </Card>
  );
}
