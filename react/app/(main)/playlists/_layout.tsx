import { Stack } from 'expo-router';
import BackNavButton from '@/components/generics/BackNavButton';

export default function PlaylistLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'My Playlists',
          headerShown: false,
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
          title: 'New Playlist',
          headerBackVisible: false,
          headerLeft: () => <BackNavButton />,
        }}
      />
    </Stack>
  );
}
