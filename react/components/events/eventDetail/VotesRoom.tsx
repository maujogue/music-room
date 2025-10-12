import { useEvent } from '@/hooks/useEvent';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackListVotes from '@/components/track/votes/TrackListVotes';
import { VStack } from '@/components/ui/vstack';
import useWebSocketClient, { TrackVote } from '@/hooks/useWebSocketClient';
import { useEffect, useState } from 'react';

interface Props {
  eventId: string;
}

export default function VotesRoom({ eventId }: Props) {
  const { data, loading, error } = useEvent(eventId);
  const { connected, sendVote, sendUnvote, trackVotes, subscribeToVotes } = useWebSocketClient(eventId);
  const [realtimeVotes, setRealtimeVotes] = useState<Map<string, TrackVote>>(new Map());

  const {
    playlist,
    loading: ploading,
    error: perror,
  } = usePlaylist(data ? data.event.playlist_id : null);

  useEffect(() => {
    if (!data?.event?.id) return;

    console.log('📡 Subscribing to realtime votes for event:', data.event.id);

    const unsubscribe = subscribeToVotes((vote: TrackVote) => {
      if (vote.eventId === data.event.id) {
        console.log('� Vote update for our event:', vote);
        setRealtimeVotes(prev => {
          const newMap = new Map(prev);
          newMap.set(vote.trackId, vote);
          return newMap;
        });
      }
    });

    return unsubscribe;
  }, [data?.event?.id, subscribeToVotes]);

  useEffect(() => {
    setRealtimeVotes(trackVotes);
  }, [trackVotes]);

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

  const onTrackSwipe = (dir: string, trackId: string) => {
    if (!connected) {
      console.warn('❌ Cannot vote: WebSocket not connected');
      return;
    }

    if (!data?.event?.id) {
      console.warn('❌ Cannot vote: No event ID');
      return;
    }


    if (dir !== 'right') {
      sendVote(data.event.id, trackId);
    } else {
      sendUnvote(data.event.id, trackId);
    }
  };

  return (
    <VStack className='flex-1 w-full px-2'>
      <TrackListVotes
        eventId={eventId}
        playlistId={playlist.id}
        playlistTracks={playlist.tracks}
        realtimeVotes={realtimeVotes}
        onTrackSwiping={(dir, trackId) => {
          onTrackSwipe(dir, trackId);
        }}
      />
    </VStack>
  );
}
