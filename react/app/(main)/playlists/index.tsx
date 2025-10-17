import AllPlaylists from '@/components/playlist/AllPlaylists';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlaylistsHome() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <AllPlaylists />
    </SafeAreaView>
  );
}
