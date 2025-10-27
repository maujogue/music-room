import { useEvent } from '@/hooks/useEvent';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackListVotes from '@/components/track/votes/TrackListVotes';
import { VStack } from '@/components/ui/vstack';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import useWebSocketClient, { TrackVote } from '@/hooks/useWebSocketClient';
import PlaylistSelectionModal from '@/components/playlist/PlaylistSelectionModal';
import { useEffect, useState } from 'react';
import { Box } from '@/components/ui/box';
import VotedTrack from '@/components/track/votes/VotedTrack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppToast } from '@/hooks/useAppToast';
import { useIsFocused } from '@react-navigation/native';
import { useProfile } from '@/contexts/profileCtx';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { RefreshCw } from 'lucide-react-native';

interface Props {
  eventId: string;
}

export default function VotesRoom({ eventId }: Props) {
  const { isConnectedToSpotify, connectSpotify, refreshProfile } = useProfile();
  const { data, loading, error, updateEvent, refetch } = useEvent(eventId);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const {
    connected,
    disconnect,
    sendVote,
    sendUnvote,
    trackVotes,
    subscribeToVotes,
    eventUserData,
    connectionAttempts,
    lastError,
    reconnect,
  } = useWebSocketClient(eventId);
  const toast = useAppToast();
  const [realtimeVotes, setRealtimeVotes] = useState<Map<string, TrackVote>>(
    new Map()
  );
  const isFocused = useIsFocused();

  const {
    playlist,
    loading: ploading,
    error: perror,
    refetch: prefetch,
  } = usePlaylist(data ? data.playlist?.id : null);

  useEffect(() => {
    if (!isFocused) {
      disconnect();
    }
  }, [isFocused, disconnect]);

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
        description: lastError
          ? lastError
          : 'Connection lost. Attempting to reconnect...',
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

  const handleConnectSpotify = async () => {
    try {
      const { error } = await connectSpotify();
      if (error) {
        throw error;
      }
      setTimeout(async () => {
        refreshProfile().then(() => {
          refetch();
          prefetch();
        });
      }, 500);
    } catch (error) {
      toast.error({
        title: 'Spotify Connection Error',
        description: (error as Error).message,
        duration: 3000,
      });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading event's data" />;
  }
  if (ploading) {
    return <LoadingSpinner text="Loading event's playlist" />;
  }
  if (!data || error) {
    return (
      <ErrorScreen
        error={error}
        actionButton={
          <Button onPress={refetch}>
            <ButtonText>Retry</ButtonText>
          </Button>
        }
      />
    );
  }
  if (perror || !playlist) {
    console.log('Playlist load error or missing playlist:', perror);
    return (
      <>
        <ErrorScreen
          error={perror}
          actionButton={
            !playlist && !data.playlist?.id ? (
              <Button
                onPress={() => setIsPlaylistModalOpen(true)}
                className='mt-8'
              >
                <ButtonText>Set Playlist</ButtonText>
              </Button>
            ) : (
              <Button onPress={refetch}>
                <ButtonText>Retry</ButtonText>
              </Button>
            )
          }
        />
        <PlaylistSelectionModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          onSelect={async playlist => {
            try {
              const payload = {
                ...data.event,
                location: data.location,
                playlist_id: playlist.id,
              } as MusicEventPayload;
              await updateEvent(payload);
              setIsPlaylistModalOpen(false);
              toast.show({
                title: 'Playlist set',
                description: 'Event playlist updated successfully.',
                duration: 3000,
              });
            } catch (e: any) {
              console.error('Failed to set playlist on event', e);
              toast.error({
                title: 'Error',
                description: e?.message ?? 'Failed to set playlist',
                duration: 4000,
              });
            }
          }}
        />
      </>
    );
  }

  if (!isConnectedToSpotify) {
    return (
      <ErrorScreen
        error='You need to connect your Spotify account to view playlist details.'
        actionButton={
          <HStack space='md' className='items-center justify-center'>
            <Button onPress={handleConnectSpotify}>
              <ButtonText>Connect Spotify</ButtonText>
            </Button>
            <Button
              onPress={() => {
                refreshProfile();
                refetch();
                prefetch();
              }}
              className='rounded-full'
              variant='link'
            >
              <RefreshCw size={20} />
            </Button>
          </HStack>
        }
      />
    );
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
            <View className='bg-gray-100 p-3 rounded-lg mb-4'>
              <Text className='text-sm text-gray-600'>
                Votes left:{' '}
                <Text className='font-bold text-blue-600'>
                  {eventUserData.vote_remaining}
                </Text>{' '}
                / {eventUserData.voteMax}
              </Text>
              <Text className='text-xs text-gray-500'>
                Total votes: {eventUserData.voteCount}
              </Text>
            </View>
            {eventUserData.voted_tracks &&
              Object.keys(eventUserData.voted_tracks).length > 0 && (
                <Box className='mb-4'>
                  <Text className='font-bold text-gray-700 mb-2'>
                    Tracks you voted for: (
                    {Object.keys(eventUserData.voted_tracks).length})
                  </Text>
                  <GestureHandlerRootView>
                    {Object.entries(eventUserData.voted_tracks).map(
                      ([trackId, voteCount]) => {
                        const track = playlist?.tracks?.find(
                          (t: PlaylistTrack) => t.track_id === trackId
                        );
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
                          <Box
                            key={trackId}
                            className='p-2 bg-gray-100 rounded mb-1'
                          >
                            <Text className='text-gray-500 text-xs'>
                              Track not found (ID: {trackId})
                            </Text>
                            <Text className='text-xs text-blue-600'>
                              Your votes: {voteCount}{' '}
                              {voteCount === 1 ? 'vote' : 'votes'}
                            </Text>
                          </Box>
                        );
                      }
                    )}
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
