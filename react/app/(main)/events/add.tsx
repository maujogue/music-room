import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useProfile } from '@/contexts/profileCtx';
import EditEventForm from '@/components/events/EditEventForm';
import { createEvent } from '@/services/events';

export default function AddNewEvent() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const { profile } = useProfile();

  const onSubmit = async (payload: MusicEventPayload) => {
    console.log('HERE IMPLEMENT POST NEW EVENT TO BACK');

    if (!profile) {
      setError('Authentification error, try reconnect with Spotify please');
      return;
    }

    try {
      const resp = await createEvent({
        ...payload,
      });
      console.log('Event created successfully:', resp);
      if (router.canGoBack()) {
        router.replace({
          pathname: '/(main)/events/[eventId]',
          params: { eventId: resp.id },
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setError(`Error creating event: ${error}`);
      return;
    }
  };

  return <EditEventForm onSubmit={onSubmit} ApiError={error} />;
}
