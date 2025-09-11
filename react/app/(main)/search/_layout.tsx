import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Search',
          headerShown: false, // We're using custom header in the Profile component
        }}
      />
    </Stack>
  );
}
