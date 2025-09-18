import React from 'react';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackListItem from '@/components/track/TrackListItem';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Icon, TrashIcon } from '@/components/ui/icon';
import { AddIcon } from '@/components/ui/icon';
import { Text, View, StyleSheet } from 'react-native';
import { usePlaylistItems } from '@/hooks/usePlaylistItems';
import { deleteItemFromPlaylist } from '@/services/playlist';
import Reanimated from 'react-native-reanimated';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';

interface Props {
  playlistId: string;
  playlistTitle?: string;
  playlistTracks: PlaylistTrack[];
  isSpotifySync?: boolean;
  onTrackDeleted?: () => void;
  canEdit?: boolean;
}

export default function TrackList({
  playlistId,
  playlistTitle,
  playlistTracks,
  isSpotifySync = false,
  onTrackDeleted,
  canEdit,
}: Props) {
  const router = useRouter();
  const handlePress = () => {
    router.push({
      pathname: '/(main)/playlists/[playlistId]/tracks/add',
      params: { playlistId, playlistTitle },
    });
  };

  if (!playlistTracks) {
    console.log('No playlistTracks provided');
    return <LoadingSpinner text='Loading playlist...' />;
  }

  const { tracks, loading, error } = usePlaylistItems(
    playlistId,
    playlistTracks
  );

  const handleSwipeableOpen = async (trackId: string) => {
    if (isSpotifySync) return; // disable editing when synced from Spotify
    try {
      await deleteItemFromPlaylist(playlistId, [trackId]);

      if (onTrackDeleted) {
        onTrackDeleted();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Optionnel: afficher une erreur à l'utilisateur
    }
  };

  if (loading) {
    return <LoadingSpinner text='Loading tracks...' />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }
  if (!tracks) {
    return <ErrorScreen error={'no tracks to load'} />;
  }

  if (tracks.length === 0) {
    return (
      <View style={[styles.center, styles.emptyBackground]}>
        <Text>No tracks in this playlist</Text>
        {!isSpotifySync && canEdit && (
          <Button variant='solid' className='mt-4' onPress={handlePress}>
            <ButtonText>Add First Track</ButtonText>
            <ButtonIcon as={AddIcon} className='ml-2' />
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {!isSpotifySync && canEdit && (
          <Button variant='solid' className='mt-2' onPress={handlePress}>
            <ButtonText>Add Track</ButtonText>
            <ButtonIcon as={AddIcon} className='ml-2' />
          </Button>
        )}

        {tracks.map((item, index) => (
          <TrackListItem
            key={item.spotify_id || `track-${index}`}
            track={item.details}
            renderRightAction={
              isSpotifySync
                ? undefined
                : () => (
                    <Reanimated.View style={[styles.deleteAction]}>
                      <View className='flex-1 justify-center items-end w-full p-4'>
                        <Icon as={TrashIcon} color='white' size={6} />
                      </View>
                    </Reanimated.View>
                  )
            }
            onSwipeableOpen={
              isSpotifySync
                ? undefined
                : () => handleSwipeableOpen(item.spotify_id)
            }
          />
        ))}
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBackground: {
    backgroundColor: '#ffffffff',
    minHeight: 200,
  },
  deleteAction: {
    flex: 1,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
});
