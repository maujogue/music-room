import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import AllPlaylists from '@/components/ui/playlist/AllPlaylists';

export default function PlaylistsHome() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 32 }}>My Playlists</Text>
      <AllPlaylists />
    </View>
  );
}
