import { useEvent } from '@/hooks/useEvent';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackListVotes from '@/components/track/votes/TrackListVotes';
import { VStack } from '@/components/ui/vstack';
import EmptyState from '@/components/generics/screens/EmptyStateScreen';
import emptyPng from '@/assets/no-playlist.png';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';


interface Props {
  eventId: string;
}

export default function VotesRoom({ eventId }: Props) {
  const { data, loading, error } = useEvent(eventId);
  const {
    playlist,
    loading: ploading,
    error: perror,
    refetch,
  } = usePlaylist(data ? data.playlist?.id : null);
  const router = useRouter();
  const goToEditEvent = () => {
    router.push(`(main)/events/${eventId}/edit`);
  }

  if (loading) {
    return <LoadingSpinner text="Loading event's data" />;
  }
  if (ploading) {
    return <LoadingSpinner text="Loading event's playlist" />;
  }
  if (!data || error) {
    return <ErrorScreen error={error} />;
  }
  if (perror === "no playlist found, no id given") {
    return <Box className='min-h-screen w-full'>
      <EmptyState
        source={emptyPng}
        title="No playlist"
        subtitle="An event without music ? How dare you ? "
        text="Add a playlist fast to not disappoint your guests !"
        onPressCta={goToEditEvent}
        compact
      />
    </Box>;
  }
  if (perror || !playlist) {
    return <ErrorScreen error={perror} />;
  }

  const onTrackSwipe = (dir: SwipeDirection, trackId: string) => {
    console.log(`SWIPE to ${dir} for track(${trackId})!`);
    // TODO : run refetch here or websockets mechanics ?
    refetch();
  };

  return (
    <VStack className='flex-1 w-full px-2'>
      <TrackListVotes
        eventId={eventId}
        playlistId={playlist.id}
        playlistTracks={playlist.tracks}
        onTrackSwiping={(dir, trackId) => {
          onTrackSwipe(dir, trackId);
        }}
      />
    </VStack>
  );
}
