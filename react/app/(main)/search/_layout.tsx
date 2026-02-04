import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Search',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='playlist/[playlistId]'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='event/[eventId]'
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
