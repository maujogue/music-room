import { Stack, Tabs } from 'expo-router';
import '@/global.css';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider, useAuth } from '@/contexts/authCtx';
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query';
import Purchases from 'react-native-purchases';

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
    },
  },
});

// Set up focus manager for mobile
AppState.addEventListener('change', onAppStateChange);

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode='light'>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { session, user } = useAuth();
  const hasConfiguredPurchases = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    if (!apiKey) {
      console.warn(
        'RevenueCat API key is missing. Set EXPO_PUBLIC_REVENUECAT_API_KEY.'
      );
      return;
    }

    if (!hasConfiguredPurchases.current) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.INFO);
      Purchases.configure({ apiKey });
      hasConfiguredPurchases.current = true;
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' || !hasConfiguredPurchases.current) {
      return;
    }

    const syncAppUser = async () => {
      try {
        if (user?.id) {
          await Purchases.logIn(user.id);
          if (user.email) {
            await Purchases.setAttributes({ email: user.email });
          }
        } else {
          await Purchases.logOut();
        }
      } catch (error) {
        console.error('Failed to sync RevenueCat app user:', error);
      }
    };

    syncAppUser();
  }, [user?.id, user?.email]);

  return (
    <GluestackUIProvider mode='light'>
      <Stack>
        <Tabs.Protected guard={!!session}>
          <Tabs.Screen name='(main)' options={{ headerShown: false }} />
        </Tabs.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen
          name='update-password'
          options={{ headerShown: false, presentation: 'modal' }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
