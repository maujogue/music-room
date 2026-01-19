import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useCurrentPosition } from './useCurrentPosition';
import { getEventsWithRadar } from '@/services/events';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNearbyEventsNotification() {
  const { coords } = useCurrentPosition({ radiusKm: 1 });
  const router = useRouter();

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };

    requestPermissions();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      response => {
        const url = response.notification.request.content.data?.url;
        if (url) {
          router.push(url as Href);
        }
      }
    );

    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    if (!coords) {
      console.log('[Notification] No coords yet');
      return;
    }

    const checkNearbyEvents = async () => {
      console.log('[Notification] Checking events at:', coords);
      try {
        const events = await getEventsWithRadar(coords);
        console.log(
          `[Notification] Found ${events.length} total events on radar`
        );

        // dist in 'radar' is in meters (confirmed in backend controller)
        // 1000 meters = 1km
        const nearbyEventsCount = events.filter(
          e => e.radar.dist <= 1000
        ).length;
        console.log(`[Notification] ${nearbyEventsCount} events within 1000m`);

        if (nearbyEventsCount > 0) {
          console.log('[Notification] Triggering notification...');
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Nearby Events!',
              body: `There are ${nearbyEventsCount} event(s) near you. Click to see them on the radar!`,
              data: { url: '/events/radar' },
            },
            trigger: null, // show immediately
          });
        }
      } catch (error) {
        console.error('[Notification] Error checking nearby events:', error);
      }
    };

    // Check immediately and then every minute
    checkNearbyEvents();
    const interval = setInterval(checkNearbyEvents, 60000);

    return () => clearInterval(interval);
  }, [coords]);
}
