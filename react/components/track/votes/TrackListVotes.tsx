import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackListItem from '@/components/track/TrackListItem';
import { Icon } from '@/components/ui/icon';
import { PlusCircleIcon, CircleMinus } from 'lucide-react-native';
import { usePlaylistItems } from '@/hooks/usePlaylistItems';
import Reanimated from 'react-native-reanimated';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import InfoScreen from '@/components/generics/screens/InfoScreen';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import colors from 'tailwindcss/colors';
import { useVoteCountIndex } from '@/hooks/useEventVotesCount';
import { VStack } from '@/components/ui/vstack';
import { useEffect } from 'react';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';

interface TrackVote {
  eventId: string;
  eventName?: string;
  trackId: string;
  voteCount: number;
  voters: string[];
}

interface Props {
  eventId: string;
  playlistId: string;
  playlistTitle?: string;
  realtimeVotes?: Map<string, TrackVote>;
  playlistTracks: PlaylistTrack[];
  onTrackSwiping?: (dir: SwipeDirection, trackId: string) => void;
}

export default function TrackListVotes({
  eventId,
  playlistId,
  playlistTitle: _playlistTitle,
  playlistTracks,
  onTrackSwiping,
  realtimeVotes,
}: Props) {
  const router = useRouter();
  const { tracks, loading, error } = usePlaylistItems(
    playlistId,
    playlistTracks
  );
  const {
    getVoteCount,
    getTrackId,
    loading: loadingV,
    error: errorV,
  } = useVoteCountIndex(eventId);

  // --------------------------------------------------
  // CONTINUE DEBUG HERE TO GET WHAT IS WITH VOTES RETREIVED
  useEffect(() => {
    if (!playlistTracks) return;

    console.log('tracks changed:', playlistTracks.length);
  }, [tracks]);

  useEffect(() => {
    console.log('Realtime votes updated:', realtimeVotes);
  }, [realtimeVotes]);

  useEffect(() => {
    if (!tracks) return;

    console.log('tracks changed:', playlistTracks.length);
  }, [tracks]);
  // --------------------------------------------------
  // --------------------------------------------------

  const getRealtimeVoteCount = (trackId: string): number => {
    const realtimeVote = realtimeVotes?.get(trackId);
    if (realtimeVote) {
      return realtimeVote.voteCount;
    }

    const fallbackVotes = getVoteCount(trackId);
    return fallbackVotes;
  };

  const handleSwipeableOpen = async (dir: SwipeDirection, trackId: string) => {
    try {
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
    return (
      <InfoScreen
        title={'No Tracks Available'}
        text={'Playlist chosen for event is empty'}
        actionButton={
          <Button
            onPress={() => {
              router.push(`(main)/playlists/${playlistId}`);
            }}
          >
            <ButtonText className='text-center'>Go to Playlist</ButtonText>
          </Button>
        }
      />
    );
  }

  return (
    <VStack className='flex-1'>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {[...tracks]
          .sort((a, b) => {
            const va = getRealtimeVoteCount(getTrackId(a));
            const vb = getRealtimeVoteCount(getTrackId(b));
            if (vb !== va) return vb - va;
            return a.details.name.localeCompare(b.details.name);
          })
          .map((track: PlaylistTrack) => {
            const trackId = getTrackId(track);
            const voteCount = getRealtimeVoteCount(trackId);

            return (
              <Pressable key={track.added_at}>
                <TrackListItem
                  track={track.details}
                  voteCount={voteCount}
                  renderRightAction={() => (
                    <Reanimated.View
                      style={{
                        flex: 1,
                        backgroundColor: colors.red[600],
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 80,
                      }}
                    >
                      <Box className='flex-1 justify-center items-end w-full p-4'>
                        <Icon as={CircleMinus} color='white' size='xl' />
                      </Box>
                    </Reanimated.View>
                  )}
                  renderLeftAction={() => (
                    <Reanimated.View
                      style={{
                        flex: 1,
                        backgroundColor: colors.green[600],
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 80,
                      }}
                    >
                      <Box className='flex-1 justify-center items-start w-full p-4'>
                        <Icon as={PlusCircleIcon} color='white' size='xl' />
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
