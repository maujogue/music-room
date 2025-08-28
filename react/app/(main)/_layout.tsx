import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/ui/avatar';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import vibingImg from '@/assets/vibing.jpg';
import { ProfileProvider } from '@/contexts/profileCtx';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <ProfileProvider>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name='index'
          options={{
            title: 'Home',
            tabBarIcon: () => <Text>🏠</Text>,
          }}
        />
        <Tabs.Screen
          name='playlists'
          options={{
            title: 'Playlists',
            tabBarIcon: () => <Text>📋</Text>,
          }}
        />
        <Tabs.Screen
          name='profile'
          options={{
            title: 'Profile',
            tabBarIcon: () => (
              <Avatar size='sm'>
                <AvatarFallbackText>👤</AvatarFallbackText>
                <AvatarImage source={vibingImg} />
              </Avatar>
            ),
          }}
        />
      </Tabs>
    </ProfileProvider>
  );
}
