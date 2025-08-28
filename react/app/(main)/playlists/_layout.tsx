import { Stack } from 'expo-router';

export default function PlaylistLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ title: 'My Playlists' }} />
      <Stack.Screen name='[id]' options={{ headerShown: false }} />
    </Stack>
  );
}
