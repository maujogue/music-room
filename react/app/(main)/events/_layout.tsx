import { Stack } from 'expo-router';
import NewItemButton from '@/components/generics/NewItemButton';

export default function EventLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'My Events',
          headerRight: () => <NewItemButton routePath='(main)/events/add/' />,
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
