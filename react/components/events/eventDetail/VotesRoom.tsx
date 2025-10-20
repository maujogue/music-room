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
import { Box } from '@/components/ui/box';
import VotedTrack from '@/components/track/votes/VotedTrack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppToast } from '@/components/generics/AppToast';
import { useAppToast } from '@/hooks/useAppToast';

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
    eventUserData,
    connectionAttempts,
    lastError,
    reconnect
  } = useWebSocketClient(eventId);
  const toast = useAppToast();
  const [realtimeVotes, setRealtimeVotes] = useState<Map<string, TrackVote>>(new Map());

  const {
    playlist,
    loading: ploading,
    error: perror,
  } = usePlaylist(data ? data.playlist?.id : null);

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
    if (!connected && connectionAttempts > 0) {
      toast.error({
        title: 'Disconnected from server',
        description: lastError ? lastError : 'Connection lost. Attempting to reconnect...',
        duration: 3000,
      });
      reconnect();
    }
  }, [connected, reconnect]);

  useEffect(() => {
    setRealtimeVotes(trackVotes);
  }, [trackVotes]);

  useEffect(() => {
    if (!connected && connectionAttempts > 0) {
      reconnect();
    }
  }, [connected, connectionAttempts, reconnect]);

  useEffect(() => {
    if (eventUserData) {
      console.log('👤 Event user data in VotesRoom:', {
        voteCount: eventUserData.voteCount,
        vote_remaining: eventUserData.vote_remaining,
        voteMax: eventUserData.voteMax,
        voted_tracks: eventUserData.voted_tracks,
        voted_tracks_keys: Object.keys(eventUserData.voted_tracks || {}),
        voted_tracks_length: Object.keys(eventUserData.voted_tracks || {}).length
      });
    }
  }, [eventUserData]);

  useEffect(() => {
    console.log('votedTracks:', eventUserData?.voted_tracks);
  }, [eventUserData?.voted_tracks]);

  if (loading) {
    return <LoadingSpinner text="Loading event's data" />;
  }
  if (ploading) {
    return <LoadingSpinner text=">Loading event's playlist" />;
  }
  if (!data || error) {
    return <ErrorScreen error={error} />;
  }
  if (perror || !playlist) {
    return <ErrorScreen error={perror} />;
  }

  const onTrackSwipe = (dir: string, trackId: string) => {
    if (!connected) {
      toast.error({
        title: 'Cannot vote',
        description: 'Not connected to server.',
        duration: 3000,
      });
      return;
    }

    if (!data?.event?.id) {
      toast.error({
        title: 'Cannot vote',
        description: 'No event ID',
        duration: 3000,
      });
      return;
    }

    if (dir !== 'left') {
      if (eventUserData?.vote_remaining === 0) {
        toast.show({
          title: 'Cannot vote',
          description: 'No votes remaining',
          duration: 3000,
        });
        return;
      }

      sendVote(eventId, trackId);
    } else {
      sendUnvote(eventId, trackId);
    }
  };

  return (
    <>
      <VStack className='flex-1 w-full'>
        {eventUserData && (
          <>
            <View className="bg-gray-100 p-3 rounded-lg mb-4">
              <Text className="text-sm text-gray-600">
                Votes left: <Text className="font-bold text-blue-600">{eventUserData.vote_remaining}</Text> / {eventUserData.voteMax}
              </Text>
              <Text className="text-xs text-gray-500">
                Total votes: {eventUserData.voteCount}
              </Text>
            </View>
            {eventUserData.voted_tracks && Object.keys(eventUserData.voted_tracks).length > 0 && (
                <Box className="mb-4">
                  <Text className="font-bold text-gray-700 mb-2">
                    Tracks you voted for: ({Object.keys(eventUserData.voted_tracks).length})
                  </Text>
                  <GestureHandlerRootView>
                    {Object.entries(eventUserData.voted_tracks).map(([trackId, voteCount]) => {
                      const track = playlist?.tracks?.find((t: any) => t.spotify_id === trackId);
                      return track ? (
                        <VotedTrack
                          key={trackId}
                          track={track}
                          voteCount={voteCount}
                          onSwipeableOpen={(dir: 'left' | 'right') => {
                            onTrackSwipe(dir, trackId);
                            return Promise.resolve(true);
                          }}
                        />
                      ) : (
                        <Box key={trackId} className="p-2 bg-gray-100 rounded mb-1">
                          <Text className="text-gray-500 text-xs">Track not found (ID: {trackId})</Text>
                          <Text className="text-xs text-blue-600">
                            Your votes: {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                          </Text>
                        </Box>
                      );
                    })}
                  </GestureHandlerRootView>
                </Box>
            )}
          </>
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
