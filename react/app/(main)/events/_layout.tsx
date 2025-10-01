import { Stack } from 'expo-router';

export default function EventLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Events',
          headerShown: true,
          headerShadowVisible: false,
        }}
      />

      <Stack.Screen
        name='[eventId]'
        options={{
          headerShown: false,
        }}
      />
      {/*
      <Stack.Screen name='add'
        options={{
          presentation: 'modal',
          title: 'New Playlist',
          headerBackVisible: false,
          headerRight: () => <CancelButton />,
        }}
      /> */}
    </Stack>
  );
}
