import AllPlaylists from '@/components/playlist/AllPlaylists';
import { SafeAreaView } from 'react-native-safe-area-context';
import { syncSpotifyPlaylists } from '@/services/playlist';
import { Button } from 'react-native';

export default function PlaylistsHome() {
  const handlePress = async () => {
    try {
      await syncSpotifyPlaylists();
      alert('Playlists synced successfully!');
    }
    catch (error) {
      console.error('Error syncing playlists:', error);
      alert('Failed to sync playlists.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 12 }} edges={['top']}>
      <Button title="Sync Spotify Playlists" onPress={handlePress} />
      <AllPlaylists />
    </SafeAreaView>
  );
}
