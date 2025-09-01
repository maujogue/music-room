import React from 'react';
import { Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { MOCK_TRACKS } from '@/mocks/mockTracks';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackListItem from '@/components/track/TrackListItem';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { AddIcon } from '@/components/ui/icon';

type Props = {
  playlistId: string;
};

export default function TrackList({ playlistId }: Props) {
  const mocks = MOCK_TRACKS;

  const handlePress = () => {
    router.push({
      pathname: '/(main)/playlists/[playlistId]/tracks/add',
      params: { playlistId },
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Button
        variant="solid"
        className="mt-2"
        onPress={handlePress}
      >
        <ButtonText>Add Track</ButtonText>
        <ButtonIcon as={AddIcon} className="ml-2" />
      </Button>
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
