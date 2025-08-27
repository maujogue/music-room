import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { usePlaylist } from '@/hooks/usePlaylist'
import TrackList from '@/components/ui/track/TrackList';


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
        }}
      />

      <Image source={{ uri: imageUri }} style={styles.cover} />
      <Text style={styles.title}>{playlist.name}</Text>
      {playlist.description ? (
        <Text style={styles.description}>{playlist.description}</Text>
      ) : null}
      <Text style={styles.owner}>By {playlist.owner?.display_name}</Text>
      <TrackList />
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
