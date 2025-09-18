import { View, Text } from 'react-native';
import { useUserPlaylists } from '@/hooks/useUserPlaylists';
import PlaylistList from '@/components/playlist/PlaylistList';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { Button } from '@/components/ui/button';
import CreatePlaylistItem from '@/components/playlist/CreatePlaylistItem';

export default function AllPlaylists() {
  const { playlists, refetch, loading, error } = useUserPlaylists();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (loading) return <LoadingSpinner text={'Playlists loading...'} />;
  if (error) return <ErrorScreen error={error} />;
  if (!playlists) return <ErrorScreen error={'No playlist found'} />;

  if (playlists.length === 0) {
    return (
      <>
        <CreatePlaylistItem />
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
