import AllPlaylists from '@/components/playlist/AllPlaylists';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubscription } from '@/contexts/subscriptionCtx';

export default function PlaylistsHome() {
  const { isPremium, isLoading } = useSubscription();

  if (isLoading || !isPremium) {
    return (
      <>
        <SafeAreaView style={{ flex: 1 }} edges={['top']} />
      </>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <AllPlaylists />
    </SafeAreaView>
  );
}
