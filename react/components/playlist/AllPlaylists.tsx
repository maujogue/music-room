import { View, Text } from 'react-native';
import { useUserPlaylists } from '@/hooks/useUserPlaylists';
import PlaylistList from '@/components/playlist/PlaylistList';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import AddPlaylistItem from '@/components/playlist/AddPlaylistItem';
import { useRouter } from 'expo-router';

export default function AllPlaylists() {
  const { playlists, refetch, loading, error } = useUserPlaylists();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onPlaylistPress = () => {
    router.push('(main)/playlists/add/');
  };

  if (loading) return <LoadingSpinner text={'Playlists loading...'} />;
  if (error) return <ErrorScreen error={error} />;
  if (!playlists) return <ErrorScreen error={'No playlist found'} />;

  if (playlists.length === 0) {
    return (
      <>
        <AddPlaylistItem onPress={onPlaylistPress} title='Create playlist' />
        <Text>no playlist found</Text>
      </>
    );
  }

  const sections: PlaylistSection[] = [
    {
      title: 'My collaborative playlists',
      data: playlists.filter(pl => pl.collaborative),
    },
    {
      title: 'My playlists',
      data: playlists.filter(pl => !pl.collaborative),
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <PlaylistList sections={sections} />
    </View>
  );
}
