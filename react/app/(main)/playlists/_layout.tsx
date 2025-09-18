import { Stack } from 'expo-router';
import NewItemButton from '@/components/generics/NewItemButton';
import CancelButton from '@/components/generics/CancelButton';
import PlaylistMenu from '@/components/playlist/PlaylistMenu';

export default function PlaylistLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'My Playlists',
          headerShadowVisible: false,
          headerRight: () => <PlaylistMenu />,
        }}
      />

      <Stack.Screen
        name='[playlistId]'
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name='add'
        options={{
          presentation: 'modal',
          title: 'New Playlist',
          headerBackVisible: false,
          headerRight: () => <CancelButton />,
        }}
      />
    </Stack>
  );
}
