import { SpotifyTrack } from '@/types/spotify';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';


type Props = {
  track: SpotifyTrack;
};

export default function TrackListItem({ track }: Props) {
  const getImage = () => {
    const hasValidImage =
      track &&
      track.album &&
      Array.isArray(track.album.images) &&
      track.album.images.length > 0 &&
      track.album.images[0]?.url;

    return {
      uri: hasValidImage
        ? track.album.images[0]!.url
        : 'https://picsum.photos/144',
    };
  };

  return (
    <Card size="md" className="rounded-lg flex-row gap-2 mb-2 p-2" variant="outline">
      <Image source={getImage()} className="rounded-md h-[60px] w-[60px]" alt="Playlist avatar" />
      <VStack  className="pt-1">
        <Heading size='md' className='text-typography-800'>{track.name}</Heading>
        {track.artists && (
          <Text size='sm' className="text-typography-400">By {track.artists[0].name}</Text>
        )}
      </VStack>
    </Card>
  );
}
