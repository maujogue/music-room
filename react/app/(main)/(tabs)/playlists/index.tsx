import { Text } from 'react-native';
import AllPlaylists from '@/components/ui/playlist/AllPlaylists';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlaylistsHome() {
  return (
    <SafeAreaView style={{ flex: 1 , paddingHorizontal: 12 }} edges={['top']}>
      {/* TODO : here playlist_home HEADER  ?? inside NavigationStackHeader ? => _layout ? */}
      <AllPlaylists />
    </SafeAreaView>

  );
}
