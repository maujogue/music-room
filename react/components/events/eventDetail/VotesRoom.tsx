import { useEvent } from '@/hooks/useEvent';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackListVotes from '@/components/track/votes/TrackListVotes';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import useWebSocketClient, { TrackVote } from '@/hooks/useWebSocketClient';
import { use, useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';
import { Box } from '@/components/ui/box';

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

      const success = sendVote(eventId, trackId);
      if (success) {
        console.log('✅ Vote sent successfully for track:', trackId);
      }
    } else {
      const success = sendUnvote(eventId, trackId);
      if (success) {
        console.log('✅ Unvote sent successfully for track:', trackId);
      }
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
                  {Object.entries(eventUserData.voted_tracks).map(([trackId, voteCount]) => {
                    const track = playlist?.tracks?.find((t: any) => t.spotify_id === trackId);
                    return track ? (
                      <Box key={track.spotify_id} className="p-2 bg-white rounded mb-1 border-l-4 border-blue-500">
                        <HStack>
                          <Image source={{ uri: track.details.album.images[0]?.url }} style={{ width: 40, height: 40 }} />
                          <VStack className="ml-3">
                            <Text className="text-gray-800 font-medium">{track.details.name}</Text>
                            <Text className="text-xs text-gray-500">
                              {track.details.artists?.map((artist: any) => artist.name).join(', ')}
                            </Text>
                            <Text className="text-xs text-blue-600 mt-1">
                              Your votes: {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    ) : (
                      <Box key={trackId} className="p-2 bg-gray-100 rounded mb-1">
                        <Text className="text-gray-500 text-xs">Track not found (ID: {trackId})</Text>
                        <Text className="text-xs text-blue-600">
                          Your votes: {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                        </Text>
                      </Box>
                    );
                  })}
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
