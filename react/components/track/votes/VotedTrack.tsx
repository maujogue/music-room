import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CircleMinus, CirclePlus } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useRef } from 'react';

type Props = {
  track: PlaylistTrack;
  voteCount: number;
  onSwipeableOpen: (dir: 'left' | 'right') => Promise<boolean>;
};

export default function VotedTrack({
  track,
  voteCount,
  onSwipeableOpen,
}: Props) {
  const swipeableRef = useRef<any>(null);

  const renderRightAction = () => (
    <Box className='flex-1 bg-red-500 justify-center items-end px-8 rounded-l'>
      <CircleMinus color='white' size={30} />
    </Box>
  );

  const renderLeftAction = () => (
    <Box className='flex-1 bg-green-500 justify-center items-start px-8 rounded-r'>
      <CirclePlus color='white' size={30} />
    </Box>
  );

  const handleSwipeableOpen = async (direction: 'left' | 'right') => {
    try {
      const result = await onSwipeableOpen(direction);

      // Fermer le swipeable après l'action, que ce soit réussi ou échoué
      if (swipeableRef.current) {
        swipeableRef.current.close();
      }

      return result;
    } catch (error) {
      // Fermer même en cas d'erreur
      if (swipeableRef.current) {
        swipeableRef.current.close();
      }
      console.error('Error in swipe action:', error);
      return false;
    }
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      onSwipeableOpen={handleSwipeableOpen}
      renderLeftActions={renderLeftAction}
      renderRightActions={renderRightAction}
      leftThreshold={75}
      rightThreshold={75}
    >
      <Card
        key={track.track_id}
        className='bg-white rounded border-l-4 border-blue-500'
      >
        <HStack>
          <Image
            source={{ uri: track.details.album.images[0]?.url }}
            style={{ width: 40, height: 40 }}
            alt="Track album art"
          />
          <Box className='flex-1 flex-row justify-between items-center'>
            <VStack className='ml-3'>
              <Text className='text-gray-800 font-medium'>
                {track.details.name}
              </Text>
              <Text className='text-xs text-gray-500'>
                {track.details.artists
                  ?.map((artist: any) => artist.name)
                  .join(', ')}
              </Text>
              <Text className='text-xs text-blue-600 mt-1'>
                Your votes: {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
              </Text>
            </VStack>
          </Box>
        </HStack>
      </Card>
    </ReanimatedSwipeable>
  );
}
