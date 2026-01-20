import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/ui/avatar';
import { Tabs } from 'expo-router';
import vibingImg from '@/assets/vibing.jpg';
import { ProfileProvider, useProfile } from '@/contexts/profileCtx';
import { SubscriptionProvider } from '../../contexts/subscriptionCtx';
import { PlayIcon, Icon, StarIcon, SearchIcon } from '@/components/ui/icon';
import { useSubscription } from '@/contexts/subscriptionCtx';
import { useAppToast } from '@/hooks/useAppToast';
import { presentPaywall } from '@/components/subscription/PaywallModal';

import { useNearbyEventsNotification } from '@/hooks/useNearbyEventsNotification';

export default function AppLayout() {
  useNearbyEventsNotification();

  return (
    <ProfileProvider>
      <SubscriptionProvider>
        <AppTabs />
      </SubscriptionProvider>
    </ProfileProvider>
  );
}

import { useCachePrewarmer } from '@/hooks/useCachePrewarmer';

function AppTabs() {
  const { isPremium } = useSubscription();
  const { profile } = useProfile();
  const toast = useAppToast();

  const showPaywall = async () => {
    await presentPaywall({ isPremium, toast });
  };

  // Pre-warm the cache for core data
  useCachePrewarmer();

  return (
    <>
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
          listeners={{
            tabPress: e => {
              if (!isPremium) {
                e.preventDefault();
                void showPaywall();
              }
            },
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
                <AvatarFallbackText>
                  {profile?.username ? profile.username[0].toUpperCase() : '👤'}
                </AvatarFallbackText>
                {profile?.avatar_url ? (
                  <AvatarImage source={{ uri: profile.avatar_url }} />
                ) : (
                  <AvatarImage source={vibingImg} />
                )}
              </Avatar>
            ),
          }}
        />
        <Tabs.Screen name='index' options={{ href: null }} />
      </Tabs>
    </>
  );
}
