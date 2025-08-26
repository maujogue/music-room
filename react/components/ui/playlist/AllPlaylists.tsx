import React from 'react';
import { View, Text } from 'react-native';
import { useUserPlaylists } from '@/hooks/useUserPlaylists'
import PlaylistList from '@/components/ui/playlist/PlaylistList';

export default function AllPlaylists() {
  const { playlists, loading, error } = useUserPlaylists();

  if (loading) return <Text>Playlists loading...</Text>;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;
  if (!playlists) return <Text>Aucune playlist disponible</Text>;

  const collaborativePlaylists = playlists.filter(pl => pl.collaborative);
  const nonCollaborativePlaylists = playlists.filter(pl => !pl.collaborative);

  return (
    <View style={{ flex: 1 }}>
      {/* todo add icon */}
      <PlaylistList playlists={collaborativePlaylists} title="My collaboratives playlists" />
      <PlaylistList playlists={nonCollaborativePlaylists} title="My playlists" />
    </View>
  );
}
