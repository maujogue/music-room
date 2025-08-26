import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function AppLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name='all_playlists'
        options={{
          title: 'Playlists',
          tabBarIcon: () => <Text>📋</Text>,
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: () => <Avatar size='sm'>
            <AvatarFallbackText>👤</AvatarFallbackText>
            <AvatarImage source={require('../../assets/vibing.jpg')} />
          </Avatar>,
        }}
      />
    </Tabs>
  );
}
