import CancelButton from '@/components/generics/CancelButton';
import { Stack } from 'expo-router';

export default function PlaylistDetailLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: '',
          headerShown: true,
          headerRight: () => <CancelButton />,
          headerTransparent: true,
          headerTintColor: 'white',
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
        name="tracks/add"
        options={({ route }) => ({
          title: route.params.playlistTitle || '',
          presentation: 'modal',
          headerShadowVisible: false,
        })}
      />
    </Stack>
  );
}
