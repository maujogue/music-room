import { Stack, Tabs } from 'expo-router';
import '@/global.css';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider, useAuth } from '@/contexts/authCtx';
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query';

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

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <GluestackUIProvider mode='light'>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}

function RootNavigator() {
  const { session } = useAuth();

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
