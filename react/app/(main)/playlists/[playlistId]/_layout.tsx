import CancelButton from '@/components/generics/CancelButton';
import { Stack } from 'expo-router';

export default function PlaylistDetailLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Playlist',
          headerShown: true,
          headerRight: () => <CancelButton />,
        }}
      />
      <Stack.Screen
        name='tracks/[trackId]'
        options={{
          title: 'Track',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name='tracks/add'
        options={{
          title: 'Add Track',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
