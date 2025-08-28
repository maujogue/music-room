import React from 'react';
import { Pressable } from 'react-native';
import { Link } from 'expo-router';
import { MOCK_TRACKS } from '@/mocks/mockTracks';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackListItem from '@/components/track/TrackListItem';

type Props = {
  playlistId: string;
};

export default function TrackList({ playlistId }: Props) {
  const mocks = MOCK_TRACKS;
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlatList
        data={mocks}
        renderItem={({ item }) => (
          <>
            <Link
              href={{
                pathname: '/(main)/playlists/[playlistId]/tracks/[trackId]',
                params: { playlistId, trackId: item.id },
              }}
              asChild
            >
              <Pressable>
                <TrackListItem track={item} />
              </Pressable>
            </Link>
          </>
        )}
        keyExtractor={item => item.id}
      />
    </GestureHandlerRootView>
  );
}
