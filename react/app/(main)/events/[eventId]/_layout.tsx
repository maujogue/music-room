import CancelButton from '@/components/generics/CancelButton';
import { Stack } from 'expo-router';

export default function EventDetailLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: '#aeaeae',
          headerRight: () => <CancelButton />,
        }}
      />
      <Stack.Screen
        name='edit'
        options={{
          presentation: 'modal',
          title: '',
          headerShadowVisible: false,
          headerRight: () => <CancelButton />,
        }}
      />
    </Stack>
  );
}
