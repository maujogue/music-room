import { Stack, Tabs } from 'expo-router';
import '@/global.css';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { SessionProvider, useSession } from '../contexts/authCtx';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <GluestackUIProvider mode='light'>
      <SessionProvider>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </SessionProvider>
    </GluestackUIProvider>
  );
}

function RootNavigator() {
  const { session } = useSession();

  return (
    <GluestackUIProvider mode='light'>
       <SafeAreaProvider>
          <Stack>
            <Tabs.Protected guard={session}>
              <Tabs.Screen name='(main)' options={{ headerShown: false }} />
            </Tabs.Protected>
            <Stack.Protected guard={!session}>
              <Stack.Screen name='(auth)' options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
       </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
