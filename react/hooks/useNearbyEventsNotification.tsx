import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useCurrentPosition } from './useCurrentPosition';
import { getEventsWithRadar } from '@/services/events';

const ANDROID_CHANNEL_ID = 'nearby-events';

export function useNearbyEventsNotification() {
  const { coords } = useCurrentPosition({ radiusKm: 1 });
  const router = useRouter();

  useEffect(() => {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => {
          const behavior: Notifications.NotificationBehavior = {
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          };
          if (
            Platform.OS === 'android' &&
            Notifications.AndroidNotificationPriority?.MAX != null
          ) {
            behavior.priority = Notifications.AndroidNotificationPriority.MAX;
          }
          return behavior;
        },
      });
    } catch (e) {
      console.warn('[Notification] setNotificationHandler failed:', e);
    }

    const setupAndRequestPermissions = async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
            name: 'Nearby Events',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
          });
        }
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
      } catch (e) {
        console.warn('[Notification] Setup/permissions failed:', e);
      }
    };

    setupAndRequestPermissions();

    let subscription: { remove: () => void } | null = null;
    try {
      subscription = Notifications.addNotificationResponseReceivedListener(
        response => {
          const url = response.notification.request.content.data?.url;
          if (url) {
            router.push(url as Href);
          }
        }
      );
    } catch (e) {
      console.warn(
        '[Notification] addNotificationResponseReceivedListener failed:',
        e
      );
    }

    return () => subscription?.remove();
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
            // On Android we must use a trigger with channelId so the notification uses our channel (and shows as a banner).
            trigger:
              Platform.OS === 'android'
                ? { channelId: ANDROID_CHANNEL_ID }
                : null,
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
