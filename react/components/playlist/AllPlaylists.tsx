import React from 'react';
import { View, Text } from 'react-native';
import { useUserPlaylists } from '@/hooks/useUserPlaylists';
import PlaylistList from '@/components/playlist/PlaylistList';
import { PlaylistSection } from '@/types/playlist';

export default function AllPlaylists() {
  const { playlists, loading, error } = useUserPlaylists();

  if (loading) return <Text>Playlists loading...</Text>;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;
  if (!playlists) return <Text>No playlist found</Text>;

  if (playlists.length === 0) {
    return <Text>no playlist found</Text>;
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
      {/* todo add icon */}
      <PlaylistList sections={sections} />
    </View>
  );
}
