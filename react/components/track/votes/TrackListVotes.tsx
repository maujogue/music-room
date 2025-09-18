import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackListItem from '@/components/track/TrackListItem';
import { Icon } from '@/components/ui/icon';
import { PlusCircleIcon } from 'lucide-react-native';
import { usePlaylistItems } from '@/hooks/usePlaylistItems';
import Reanimated from 'react-native-reanimated';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import InfoScreen from '@/components/generics/screens/InfoScreen';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import colors from 'tailwindcss/colors';
import { useVoteCountIndex } from '@/hooks/useEventVotesCount';
import { Heading } from '@/components/ui/heading';
import { voteForTrack } from '@/services/events';
import { VStack } from '@/components/ui/vstack';
import TopVotesTracks from '@/components/track/votes/TopVotes';

interface Props {
  eventId: string;
  playlistId: string;
  playlistTitle?: string;
  playlistTracks: SpotifyTracksArray;
  onTrackSwiping?: (dir: SwipeDirection, trackId: string) => void;
}

export default function TrackListVotes({
  eventId,
  playlistId,
  playlistTitle,
  playlistTracks,
  onTrackSwiping,
}: Props) {
  const { tracks, loading, error } = usePlaylistItems(
    playlistId,
    playlistTracks
  );
  const {
    getVoteCount,
    getTopTracksFrom,
    getTrackId,
    loading: loadingV,
    error: errorV,
  } = useVoteCountIndex(eventId);

  const handleSwipeableOpen = async (dir: SwipeDirection, trackId: string) => {
    try {
      console.log(
        `Implement vote for track(${trackId}) in playlist(${playlistId}) and direction(${dir})`
      );
      // await voteForTrack(eventId, trackId);

      if (onTrackSwiping) {
        onTrackSwiping(dir, trackId);
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  if (!playlistTracks) {
    return <LoadingSpinner text='Loading playlist...' />;
  }
  if (loading || loadingV) {
    return <LoadingSpinner text='Loading tracks...' />;
  }
  if (error || errorV) {
    return <ErrorScreen error={error} />;
  }
  if (!tracks) {
    return <ErrorScreen error={'no tracks to load'} />;
  }
  if (tracks.length === 0) {
    return <InfoScreen text={'Playlist chosen for event is empty'} />;
  }

  return (
    <VStack className='flex-1'>
      <TopVotesTracks topTracks={getTopTracksFrom(tracks)} />

      <Heading className='mt-2'>Votes-room</Heading>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {[...tracks]
          .sort((a, b) => {
            const va = getVoteCount(getTrackId(a));
            const vb = getVoteCount(getTrackId(b));
            if (vb !== va) return vb - va;
            return a.name.localeCompare(b.name);
          })
          .map((track: SpotifyTrackWithKey) => {
            const voteCount = getVoteCount(getTrackId(track));

            return (
              <Pressable key={track.__key}>
                <TrackListItem
                  track={track}
                  voteCount={voteCount}
                  renderRightAction={() => (
                    <Reanimated.View
                      style={{
                        flex: 1,
                        backgroundColor: colors.indigo[500],
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 80,
                      }}
                    >
                      <Box className='flex-1 justify-center items-end w-full p-4'>
                        <Icon as={PlusCircleIcon} color='white' size={'lg'} />
                      </Box>
                    </Reanimated.View>
                  )}
                  renderLeftAction={() => (
                    <Reanimated.View
                      style={{
                        flex: 1,
                        backgroundColor: colors.indigo[500],
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 80,
                      }}
                    >
                      <Box className='flex-1 justify-center items-start w-full p-4'>
                        <Icon as={PlusCircleIcon} color='white' size={'lg'} />
                      </Box>
                    </Reanimated.View>
                  )}
                  onSwipeableOpen={dir =>
                    handleSwipeableOpen(dir, getTrackId(track))
                  }
                />
              </Pressable>
            );
          })}
      </GestureHandlerRootView>
    </VStack>
  );
}
