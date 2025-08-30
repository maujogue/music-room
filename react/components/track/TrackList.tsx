import React from 'react';
import { Link, router } from 'expo-router';
import { MOCK_TRACKS } from '@/mocks/mockTracks';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackListItem from '@/components/track/TrackListItem';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { AddIcon } from '@/components/ui/icon';
import { ActivityIndicator, Text, Pressable, View, StyleSheet } from 'react-native';
import { usePlaylistItems } from '@/hooks/usePlaylistItems';

type Props = {
  playlistId: string;
};

export default function TrackList({ playlistId }: Props) {
  const mocks = MOCK_TRACKS;

  const handlePress = () => {
    router.push({
      pathname: '/(main)/playlists/[playlistId]/tracks/add',
      params: { playlistId },
    });
  };
  const { tracks, loading, error } = usePlaylistItems(playlistId)

  if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size='large' />
        </View>
      );
    }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  if (!tracks) {
    return (
      <View style={styles.center}>
        <Text>No Tracks in playlist with id '{playlistId}'</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Button
        variant="solid"
        className="mt-2"
        onPress={handlePress}
      >
        <ButtonText>Add Track</ButtonText>
        <ButtonIcon as={AddIcon} className="ml-2" />
      </Button>
      <FlatList
        data={tracks}
        renderItem={({ item }) => (
          <>
            <Link
              href={{
                pathname: '/(main)/playlists/[playlistId]/tracks/[trackId]',
                params: { playlistId, trackId: item.id },
              }}
              asChild
            >
              <Pressable>
                <TrackListItem track={item} />
              </Pressable>
            </Link>
          </>
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
});
