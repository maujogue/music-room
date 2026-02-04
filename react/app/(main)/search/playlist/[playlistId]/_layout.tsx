import BackNavButton from '@/components/generics/BackNavButton';
import { Stack } from 'expo-router';

export default function PlaylistDetailLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => <BackNavButton />,
        }}
      />
      <Stack.Screen
        name='invite'
        options={{
          title: 'Invite to playlist',
          headerShown: true,
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
        options={() => ({
          title: 'Add Tracks',
          headerShadowVisible: false,
        })}
      />
      <Stack.Screen
        name='members'
        options={{
          title: 'Manage Playlist Members',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
