import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CircleMinus, CirclePlus } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useRef } from 'react';
import { padding } from 'aes-js';

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

      if (swipeableRef.current) {
        swipeableRef.current.close();
      }

      return result;
    } catch (error) {
      if (swipeableRef.current) {
        swipeableRef.current.close();
      }
      console.error('Error in swipe action:', error);
      return false;
    }
  };

  return (
    <VStack className='p-0'>
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
          className='bg-white p-0 rounded-lg'
        >
          <HStack className='w-full rounded-lg justify-between items-center'>
            <HStack className='w-full justify-start gap-2 items-center'>
            <HStack  className='items-center gap-1.5'>
              <Image className='h-10 rounded-l-lg'
                source={{ uri: track.details.album.images[0]?.url }}
                alt='Track album art'
              />
 { voteCount && (<Text className=' text-xs font-bold text-sky-500'>
                  {voteCount}
                </Text>)}
            </HStack>
                <Text className='font-medium line-clamp-1'>
                  {track.details.name}
                </Text>
              </HStack>
          </HStack>
        </Card>
      </ReanimatedSwipeable>
    </VStack>
  );
}
