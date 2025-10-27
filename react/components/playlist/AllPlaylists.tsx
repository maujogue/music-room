import { View } from 'react-native';
import { useUserPlaylists } from '@/hooks/useUserPlaylists';
import PlaylistList from '@/components/playlist/PlaylistList';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { useRouter } from 'expo-router';
import emptyPng from '@/assets/empty-playlists.png';
import EmptyState from '@/components/generics/screens/EmptyStateScreen';

export default function AllPlaylists() {
  const { playlists, refetch, loading, error } = useUserPlaylists();
  const router = useRouter();
  const params = useLocalSearchParams<{ refresh?: string }>();

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

  if (loading) return <LoadingSpinner text={'Playlists loading...'} />;
  if (error) return <ErrorScreen error={error} />;
  if (!playlists) return <ErrorScreen error={'No playlist found'} />;

  if (playlists.length === 0) {
    return (
      <EmptyState
        source={emptyPng}
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
    </View>
  );
}
