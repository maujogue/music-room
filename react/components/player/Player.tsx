import { View, Text } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { white } from 'tailwindcss/colors';
import { usePlayer } from '@/contexts/PlayerCtx';

type PlayerProps = {
  showControls?: boolean;
};

const Player = ({
  showControls,
}: PlayerProps) => {
  const { track, isPlaying, playTrack, pauseTrack, skipToNextTrack } = usePlayer();
  if (!track) {
    return (
      <View>
        <Text>No track playing</Text>
      </View>
    );
  }

  console.log('Rendering Player with track: (ici)', track);
  return (
    <Card
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      className='h-25 p-2 px-4 m-2 rounded-2xl flex justify-center items-center overflow-hidden blurred-bg'
    >
      <HStack className='items-center justify-between space-x-4 w-full'>
        {showControls && (
          <Button
            onPress={isPlaying ? pauseTrack : playTrack}
            variant='link'
            className='rounded-full px-3'
          >
            {isPlaying ? (
              <Pause size={30} color={white} />
            ) : (
              <Play size={30} color={white} />
            )}
          </Button>
        )}
        {track?.cover_url && (
          <Image source={{ uri: track.cover_url }} alt={track.title} className='rounded-md' />
        )}
        <View className='ml-4 flex-1 justify-center w-25'>
          <Text className='text-white font-semibold'>{track.title}</Text>
          {track?.artists_names &&
            <Text className='text-gray-200'>{track?.artists_names.join(', ')}</Text>
          }
          </View>
        {showControls && (
          <Button 
            onPress={skipToNextTrack} 
            className='rounded-full p-3.5'
            variant='link'
          >
            <SkipForward size={30} color={white} />
          </Button>
        )}
      </HStack>
    </Card>
  );
};

export default Player;
