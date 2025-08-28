import { Stack, Tabs } from 'expo-router';
import '@/global.css';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider, useAuth } from '../contexts/authCtx';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <GluestackUIProvider mode='light'>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GluestackUIProvider>
  );
}

function RootNavigator() {
  const { session } = useAuth();

  return (
    <GluestackUIProvider mode='light'>
      <Stack>
        <Tabs.Protected guard={session}>
          <Tabs.Screen name='(main)' options={{ headerShown: false }} />
        </Tabs.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </GluestackUIProvider>
  );
}