import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { SpotifyPlaylist } from './types';

type Props = {
  playlists: SpotifyPlaylist[];
  title: string;
};

export default function PlaylistList({ playlists, title }: Props) {
  if (playlists.length === 0) {
    return <Text>no playlist found</Text>;
  }

  return (
    // <View style={{flex: 1, backgroundColor: '#123123'}}>
    <View style={{flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{title}</Text>
      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ddd' }}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}
