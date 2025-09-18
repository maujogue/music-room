import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import NumBadge from '@/components/generics/NumBadge';

interface Props {
  rank: Rank;
  track?: SpotifyTrackWithKey;
}

export default function TopVoteItem({ rank, track }: Props) {
  const cover =
    track?.album?.images?.[0]?.url ??
    (track as any)?.images?.[0]?.url ??
    undefined;

  const sizeByRank: Record<Rank, number> = {
    1: 96,
    2: 80,
    3: 64,
  };

  const size = sizeByRank[rank];

  return (
    <VStack className='overflow-hidden' style={{ width: size }}>
      <Box className='overflow-hidden' style={{ width: size, height: size }}>
        <Card className='w-full h-full p-1 rounded overflow-hidden'>
          {cover ? (
            <Image
              alt={`cover-${track?.name ?? 'track'}`}
              source={{ uri: cover }}
              className='w-full h-full'
              resizeMode='cover'
            />
          ) : (
            <Center className='w-full h-full bg-secondary-500'>
              <Text className='font-semibold text-gray-600 text-2xl'>
                {rank}
              </Text>
            </Center>
          )}
        </Card>
      </Box>

      {track && (
        <HStack className='justify-betwee items-center'>
          <NumBadge num={rank} />
          <Text size='2xs'>{track?.name}</Text>
        </HStack>
      )}
    </VStack>
  );
}
