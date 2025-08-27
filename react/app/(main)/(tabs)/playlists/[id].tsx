import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { MOCK_PLAYLISTS } from '@/mocks/mockPlaylists';
import { SpotifyPlaylist } from '@/types/spotify';
import { usePlaylist } from '@/hooks/usePlaylist'


// export default function PlaylistDetailScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();

//   return (
//     <Text>Detail playlist id : |{id}| </Text>
//   )
// }

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { playlist, loading, error } = usePlaylist(id);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
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

  if (!playlist) {
    return (
      <View style={styles.center}>
        <Text>No playlist with id '{id}'</Text>
      </View>
    );
  }

  const imageUri = playlist.images?.[0]?.url ?? 'https://picsum.photos/300';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: playlist.name,
          // Vous pouvez ajouter un bouton de retour custom si besoin
          // headerLeft: () => (<Button title="Back" onPress={() => router.back()} />)
        }}
      />

      <Image source={{ uri: imageUri }} style={styles.cover} />
      <Text style={styles.title}>{playlist.name}</Text>
      {playlist.description ? (
        <Text style={styles.description}>{playlist.description}</Text>
      ) : null}
      <Text style={styles.owner}>By {playlist.owner?.display_name}</Text>
    </View>
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
