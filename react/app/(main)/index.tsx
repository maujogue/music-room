import { Text, View } from 'react-native';
import Player from '@/components/player/Player';
import { usePlayer } from '@/hooks/usePlayer';
import { useAuth } from '@/contexts/authCtx';

export default function Index() {
  const { signOut } = useAuth();
  const { tracks, isPlaying } = usePlayer();

  const handlePlayPause = () => {
    console.log('Play/Pause button pressed');
  };

  const handleNext = () => {
    console.log('Next button pressed');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Player
        track={tracks}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
      />
      <Text
        onPress={() => {
          signOut();
        }}
      >
        Sign Out
      </Text>
    </View>
  );
}
