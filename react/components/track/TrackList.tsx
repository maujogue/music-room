import React,  { useEffect } from 'react';
import { Link, router } from 'expo-router';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackListItem from '@/components/track/TrackListItem';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { AddIcon } from '@/components/ui/icon';
import { ActivityIndicator, Text, Pressable, View, StyleSheet } from 'react-native';
import { usePlaylistItems } from '@/hooks/usePlaylistItems';
import { deleteItemFromPlaylist } from '@/services/playlist';
import { PlaylistItemsResponse } from '@/types/spotify';
import Reanimated from 'react-native-reanimated';

interface Props {
  playlistId: string;
  playlistTracks: PlaylistItemsResponse;
  onTrackDeleted?: () => void;
}

export default function TrackList({ playlistId, playlistTracks, onTrackDeleted }: Props) {
  const handlePress = () => {
    router.push({
      pathname: '/(main)/playlists/[playlistId]/tracks/add',
      params: { playlistId },
    });
  };

  if (!playlistTracks) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading playlist...</Text>
      </View>
    );
  }

  const { tracks, loading, error } = usePlaylistItems(playlistId, playlistTracks);

  const handleSwipeableOpen = async (trackId: string) => {
    try {
      await deleteItemFromPlaylist(playlistId, [`spotify:track:${trackId}`]);

      if (onTrackDeleted) {
        onTrackDeleted();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Optionnel: afficher une erreur à l'utilisateur
    }
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  if (loading || !tracks) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading tracks...</Text>
      </View>
    );
  }

  if (tracks.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No tracks in this playlist</Text>
        <Button variant="solid" className="mt-4" onPress={handlePress}>
          <ButtonText>Add First Track</ButtonText>
          <ButtonIcon as={AddIcon} className="ml-2" />
        </Button>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Button variant="solid" className="mt-2" onPress={handlePress}>
        <ButtonText>Add Track</ButtonText>
        <ButtonIcon as={AddIcon} className="ml-2" />
      </Button>

      <FlatList
        data={tracks}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: '/(main)/playlists/[playlistId]/tracks/[trackId]',
              params: { playlistId, trackId: item.id },
            }}
            asChild
          >
            <Pressable>
              <TrackListItem
                track={item}
                renderRightAction={() => (
                  <Reanimated.View style={[styles.deleteAction]}>
                    <View className="flex-1 justify-center items-end w-full p-4">
                      <Text>Delete</Text>
                    </View>
                  </Reanimated.View>
                )}
                onSwipeableOpen={() => handleSwipeableOpen(item.id)}
              />
            </Pressable>
          </Link>
        )}
        keyExtractor={(item) => item.__key}
      />
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cover: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 12 },
  owner: { fontSize: 14, color: '#555' },
  deleteAction: {
    flex: 1,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
});
