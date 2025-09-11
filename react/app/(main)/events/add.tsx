import { apiFetch } from '@/utils/apiFetch';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useProfile } from '@/contexts/profileCtx';
import EditEventForm from '@/components/events/EditEventForm';

export default function AddNewEvent() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const { profile } = useProfile();

  const onSubmit = async (payload: EventPayload) => {
    console.log('HERE IMPLEMENT POST NEW EVENT TO BACK');

    if (!profile) {
      setError('Authentification error, try reconnect with Spotify please');
      return;
    }

    const resp: ApiResponse<Event> = await apiFetch<Event>(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/users/${profile.id}/events`,
      {
        method: 'POST',
        body: payload,
      }
    );

    if (!resp.success) {
      setError(resp.error ?? 'Unknow API error');
      return;
    }

    if (router.canGoBack()) {
      router.push('../');
    }
  };

  return <EditEventForm onSubmit={onSubmit} ApiError={error} />;
}
