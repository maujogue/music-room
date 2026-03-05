import { Stack } from 'expo-router';

export default function EventLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Events',
          headerShown: false,
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
          headerTransparent: true,
          title: '',
        }}
      />
    </Stack>
  );
}
