import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HStack } from '@/components/ui/hstack';
import TrackListItem from '@/components/track/TrackListItem';
import PlayerControls from '@/components/player/PlayerControl';

type PlayerProps = {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  showControls?: boolean;
};

const Player = ({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  showControls,
}: PlayerProps) => {
  if (!track) {
    return (
      <View>
        <Text>No track playing</Text>
      </View>
    );
  }
  return (
    <GestureHandlerRootView>
      <HStack>
        <TrackListItem track={track} />
        {showControls && (
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onNext={onNext}
          />
        )}
      </HStack>
    </GestureHandlerRootView>
  );
};

export default Player;
