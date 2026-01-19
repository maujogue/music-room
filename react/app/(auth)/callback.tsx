import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services/supabase';
import { View, Text } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();
  const { access_token, refresh_token } = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
  }>();

  useEffect(() => {
    const handleCallback = async () => {
      if (!access_token || !refresh_token) {
        console.error('Missing tokens in callback');
        router.replace('/(auth)/login');
        return;
      }

      try {
        // Set the session using the tokens from the callback
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error('Error setting session:', error);
          router.replace('/(auth)/login');
          return;
        }

        if (data.session) {
          console.log('Session established successfully');
          router.replace('/(main)');
        } else {
          console.error('No session created');
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [access_token, refresh_token, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Completing authentication...</Text>
    </View>
  );
}
