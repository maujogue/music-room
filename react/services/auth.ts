import { apiFetch } from '@/utils/apiFetch';
import { Linking } from 'react-native';

export async function connectToSpotify() {
  const response = await apiFetch<{ url: string }>(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/auth/spotify`,
    {
      method: 'POST',
    }
  );
  if (!response.success) {
    console.error('Error connecting to Spotify:', response.error);
    throw response.error;
  }
  await Linking.openURL(response.data.url);
}
