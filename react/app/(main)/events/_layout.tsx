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
      <Stack.Screen
        name='radar'
        options={{
          headerShown: true,
          presentation: 'modal',
          title: 'Events Radar',
        }}
      />
    </Stack>
  );
}
