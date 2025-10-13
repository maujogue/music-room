import { useEvent } from '@/hooks/useEvent';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackListVotes from '@/components/track/votes/TrackListVotes';
import { VStack } from '@/components/ui/vstack';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import useWebSocketClient, { TrackVote } from '@/hooks/useWebSocketClient';
import { useEffect, useState } from 'react';

interface Props {
  eventId: string;
}

export default function VotesRoom({ eventId }: Props) {
  const { data, loading, error } = useEvent(eventId);
  const {
    connected,
    sendVote,
    sendUnvote,
    trackVotes,
    subscribeToVotes,
    eventUserData
  } = useWebSocketClient(eventId);
  const [realtimeVotes, setRealtimeVotes] = useState<Map<string, TrackVote>>(new Map());


  const {
    playlist,
    loading: ploading,
    error: perror,
  } = usePlaylist(data ? data.event.playlist_id : null);

  useEffect(() => {
    if (!data?.event?.id) return;

    const unsubscribe = subscribeToVotes((vote: TrackVote) => {
      if (vote.eventId === (data?.event?.id as unknown as string)) {
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

    if (dir !== 'left') {
      if (eventUserData?.vote_remaining === 0) {
        console.warn('❌ Cannot vote: No votes remaining');
        return;
      }

      const success = sendVote(data.event.id, trackId);
      if (success) {
        console.log('✅ Vote sent successfully for track:', trackId);
      }
    } else {
      const success = sendUnvote(data.event.id, trackId);
      if (success) {
        console.log('✅ Unvote sent successfully for track:', trackId);
      }
    }
  };

  return (
    <>
      <VStack className='flex-1 w-full px-2'>
        {eventUserData && (
          <View className="bg-gray-100 p-3 rounded-lg mb-4">
            <Text className="text-sm text-gray-600">
              Votes left: <Text className="font-bold text-blue-600">{eventUserData.vote_remaining}</Text> / {eventUserData.voteMax}
            </Text>
            <Text className="text-xs text-gray-500">
              Total votes: {eventUserData.voteCount}
            </Text>
            {!connected && (
              <Text className="text-xs text-red-500">
                ⚠️ WebSocket connection closed
              </Text>
            )}
          </View>
        )}

        <TrackListVotes
          eventId={eventId}
          playlistId={playlist.id}
          playlistTracks={playlist.tracks}
          realtimeVotes={realtimeVotes}
          onTrackSwiping={(dir: string, trackId: string) => {
            onTrackSwipe(dir, trackId);
          }}
        />
      </VStack>
    </>
  );
}
