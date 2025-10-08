import { useEvent } from '@/hooks/useEvent';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackListVotes from '@/components/track/votes/TrackListVotes';
import { VStack } from '@/components/ui/vstack';
import useWebSocketClient from '@/hooks/useWebSocketClient';

interface Props {
  eventId: string;
}

export default function VotesRoom({ eventId }: Props) {
  const { data, loading, error } = useEvent(eventId);
  const { connected, sendPing } = useWebSocketClient();

  const {
    playlist,
    loading: ploading,
    error: perror,
  } = usePlaylist(data ? data.event.playlist_id : null);

  // // Subscribe to event when component mounts and data is available
  // useEffect(() => {
  //   if (data?.event?.id && connected) {
  //     console.log('📡 Subscribing to event:', data.event.id);
  //     subscribeToEvent(data.event.id);
  //   }

  //   // Cleanup: unsubscribe when component unmounts
  //   return () => {
  //     if (data?.event?.id) {
  //       console.log('📡 Unsubscribing from event:', data.event.id);
  //       unsubscribeFromEvent(data.event.id);
  //     }
  //   };
  // }, []);

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
    console.log('Connected:', connected, 'Event ID:', data?.event?.id);
    if (connected && data?.event?.id) {
      // Convert swipe direction to vote
      const vote = dir === 'right' ? 'like' : 'dislike';
      const success = sendPing();

      if (success) {
        console.log(`✅ Vote sent: ${vote} for track ${trackId}`);
      } else {
        console.error('❌ Failed to send vote');
      }
    } else {
      console.warn('Cannot vote: not connected to WebSocket or missing event data');
    }
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
