import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Profile',
          headerShown: false, // We're using custom header in the Profile component
        }}
      />
      <Stack.Screen
        name='[userId]'
        options={{
          title: 'User Profile',
          headerShown: false, // We're using custom header in the Profile component
        }}
      />
      <Stack.Screen
        name='search'
        options={{
          title: 'Find People',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='[userId]/followers'
        options={{
          title: 'Followers',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='[userId]/following'
        options={{
          title: 'Following',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
