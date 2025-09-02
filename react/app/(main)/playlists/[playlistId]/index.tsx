import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackList from '@/components/track/TrackList';
import { MOCK_PLAYLISTS } from '@/mocks/mockPlaylists';

export default function PlaylistDetailScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { playlist, loading, error } = usePlaylist(playlistId);

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

  // TODO : Playist is null : usePlaylist Hook not ready yet
  // if (!playlist) {
  //   return (
  //     <View style={styles.center}>
  //       <Text>No playlist with id '{playlistId}'</Text>
  //     </View>
  //   );
  // }

  const imageUri = playlist?.images?.[0]?.url ?? 'https://picsum.photos/300';
  const playlistTitle = playlist?.name ?? 'Playlist';
  const playlistDescription = playlist?.description ?? 'No description available';
  const playlistOwner = playlist?.owner?.display_name ?? 'Unknown';

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.cover} />
      <Text style={styles.title}>{playlistTitle}</Text>
      {playlist?.description ? (
        <Text style={styles.description}>{playlistDescription}</Text>
      ) : null}
      <Text style={styles.owner}>By {playlistOwner}</Text>
      <TrackList playlistId={playlistId} />
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
