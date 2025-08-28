import { Stack } from 'expo-router';

export default function PlaylistDetailLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Playlist',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='tracks/[id]'
        options={{
          title: 'Track',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
