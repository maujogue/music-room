import { Stack } from 'expo-router';
import BackNavButton from '@/components/generics/BackNavButton';

export default function EventDetailLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => <BackNavButton />,
        }}
      />
      <Stack.Screen
        name='edit'
        options={{
          title: '',
          headerShadowVisible: false,
          headerLeft: () => <BackNavButton />,
        }}
      />
    </Stack>
  );
}
