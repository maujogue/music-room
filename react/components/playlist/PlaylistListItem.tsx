import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useState } from 'react';
import CollaborativeBadge from '@/components/generics/CollaborativeBadge';
import PrivateBadge from '@/components/generics/PrivateBadge';
import { getRandomImage } from '@/utils/randomImage';

type Props = {
  playlist: PlaylistListItem;
  onPress?: () => void;
};

export default function PlaylistListItem({ playlist, onPress }: Props) {
  const router = useRouter();
  const [defaultImage] = useState(() => getRandomImage());

  const getImage = () => {
    return playlist.cover_url ? { uri: playlist.cover_url } : defaultImage;
  };

  const onPlaylistPress = () => {
    router.push({
      pathname: '/(main)/playlists/[playlistId]',
      params: { playlistId: playlist.id },
    });
  };

  return (
    <Pressable onPress={onPress || onPlaylistPress}>
      <Card
        size='md'
        className='rounded-lg flex-row gap-0 mb-2 p-0 overflow-hidden'
        variant='elevated'
      >
        <Image
          source={getImage()}
          className='h-[72px] w-[72px] rounded-l-lg'
          style={{ resizeMode: 'cover' }}
          alt='Playlist avatar'
        />
        <VStack className='pl-3 pr-4 py-2 flex-1 justify-center'>
          <HStack className='justify-between'>
            <Heading size='md' className='text-typography-800'>
              {playlist.name}
            </Heading>
          </HStack>
          {playlist.owner_username && (
            <Text size='sm' className='text-typography-400'>
              {playlist.owner_username}
            </Text>
          )}
        </VStack>
      </Card>
    </Pressable>
  );
}
