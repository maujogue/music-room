import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Minus, Plus } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useRef } from 'react';

type Props = {
    track: PlaylistTrack;
    voteCount: number;
    onVote: (trackId: string) => Promise<boolean> | boolean;
    onUnvote: (trackId: string) => Promise<boolean> | boolean;
};

export default function VotedTrack({ track, voteCount, onVote, onUnvote }: Props) {
  const swipeableRef = useRef<any>(null);

  const renderRightAction = () => (
    <Box className="flex-1 bg-red-500 justify-center items-center pl-4 rounded-l">
      <Minus color="white" size={20} />
      <Text className="text-white font-bold text-xs mt-1">Unvote</Text>
    </Box>
  );

  const renderLeftAction = () => (
    <Box className="flex-1 bg-green-500 justify-center items-center pr-4 rounded-r">
      <Plus color="white" size={20} />
      <Text className="text-white font-bold text-xs mt-1">Vote</Text>
    </Box>
  );

  const onSwipeableOpen = async (dir: 'left' | 'right') => {
    let success = false;

    try {
      if (dir === 'right') {
        success = await onVote(track.spotify_id);
      } else if (dir === 'left') {
        success = await onUnvote(track.spotify_id);
      }
    } catch (error) {
      console.error('❌ Error during swipe action:', error);
    } finally {
      setTimeout(() => {
        if (swipeableRef.current) {
          swipeableRef.current.close();
        }
      }, success ? 300 : 800);
    }
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      onSwipeableOpen={direction => onSwipeableOpen(direction === 'left' ? 'left' : 'right')}
      renderLeftActions={renderLeftAction}
      renderRightActions={renderRightAction}
      leftThreshold={75}
      rightThreshold={75}
    >
        <Card key={track.spotify_id} className="p-2 bg-white rounded mb-1 border-l-4 border-blue-500">
            <HStack>
              <Image source={{ uri: track.details.album.images[0]?.url }} style={{ width: 40, height: 40 }} />
              <Box className='flex-1 flex-row justify-between items-center'>
                <VStack className="ml-3">
                    <Text className="text-gray-800 font-medium">{track.details.name}</Text>
                    <Text className="text-xs text-gray-500">
                    {track.details.artists?.map((artist: any) => artist.name).join(', ')}
                    </Text>
                    <Text className="text-xs text-blue-600 mt-1">
                    Your votes: {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                    </Text>
                </VStack>
              </Box>
            </HStack>
        </Card>
    </ReanimatedSwipeable>
  )
}
