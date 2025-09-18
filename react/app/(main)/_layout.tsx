import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/ui/avatar';
import { Tabs } from 'expo-router';
import vibingImg from '@/assets/vibing.jpg';
import { ProfileProvider } from '@/contexts/profileCtx';
import { PlayIcon, Icon, StarIcon, SearchIcon } from '@/components/ui/icon';

export default function AppLayout() {
  return (
    <ProfileProvider>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name='events'
          options={{
            title: 'Events',
            tabBarIcon: () => <Icon as={StarIcon} size='md' />,
          }}
        />
        <Tabs.Screen
          name='playlists'
          options={{
            title: 'Playlists',
            tabBarIcon: () => <Icon as={PlayIcon} size='md' />,
          }}
        />
        <Tabs.Screen
          name='search'
          options={{
            title: 'Search',
            tabBarIcon: () => <Icon as={SearchIcon} size='md' />,
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
        <Tabs.Screen name='index' options={{ href: null }} />
      </Tabs>
    </ProfileProvider>
  );
}
