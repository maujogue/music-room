import { useUserPlaylists } from '@/hooks/useUserPlaylists'
import { View, Text, ActivityIndicator, FlatList } from 'react-native';

export default function PlaylistsHome() {
  const { playlists, loading, error } = useUserPlaylists();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading playlists…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  const titles = playlists.map((p) => p.name)

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'start' }}>
      <Text>My Playlists</Text>
      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}
