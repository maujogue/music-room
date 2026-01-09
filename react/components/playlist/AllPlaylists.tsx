import { View } from 'react-native';
import { useUserPlaylists } from '@/hooks/useUserPlaylists';
import PlaylistList from '@/components/playlist/PlaylistList';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { useRouter } from 'expo-router';
import EmptyState from '@/components/generics/screens/EmptyStateScreen';
import FloatButton from '@/components/generics/FloatButton';
import { RefreshCw } from 'lucide-react-native';
import { syncSpotifyPlaylists } from '@/services/playlist';
import { useAppToast } from '@/hooks/useAppToast';

export default function AllPlaylists() {
  const { playlists, refetch, loading, error } = useUserPlaylists();
  const router = useRouter();
  const params = useLocalSearchParams<{ refresh?: string }>();
  const toast = useAppToast();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    if (params.refresh) refetch();
  }, [params.refresh, refetch]);

  const onPlaylistPress = () => {
    router.push('(main)/playlists/add/');
  };

  const handleSyncSpotifyPress = async () => {
    try {
      await syncSpotifyPlaylists();
      toast.show({ title: 'Synchronized with Spotify' });
      router.setParams({ refresh: String(Date.now()) });
    } catch {
      toast.error({ title: 'Failed to sync playlists' });
    }
  };

  if (loading) return <LoadingSpinner text={'Playlists loading...'} />;
  if (error) return <ErrorScreen error={error} />;
  if (!playlists) return <ErrorScreen error={'No playlist found'} />;

  if (playlists.length === 0) {
    return (
      <EmptyState
        title='No Playlists'
        subtitle='A world without playlists… devilish, isn’t it ?'
        text='Synchronize with your Spotify account, or even create your own playlist from scratch right now !'
        onPressCta={onPlaylistPress}
      />
    );
  }

  const sections: PlaylistSection[] = [
    {
      title: 'My playlists',
      data: playlists,
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <PlaylistList sections={sections} />
      <FloatButton
        icon={RefreshCw}
        onPress={handleSyncSpotifyPress}
        className='absolute bottom-4 right-4 rounded-full p-4 blurred-bg'
      />
    </View>
  );
}
