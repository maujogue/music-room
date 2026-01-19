import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useProfile } from '@/contexts/profileCtx';
import EditEventForm from '@/components/events/EditEventForm';
import { createEvent } from '@/services/events';
import { useAppToast } from '@/hooks/useAppToast';

export default function AddNewEvent() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const { profile } = useProfile();
  const toast = useAppToast();

  const onSubmit = async (payload: MusicEventPayload) => {
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
    } catch (error: any) {
      console.error('Error creating event:', error);
      const errorStatus = error?.status;
      const errorMessage = error?.message || `Error creating event: ${error}`;

      // Show toast for duplicate (409) or forbidden (403) errors
      if (errorStatus === 409 || errorStatus === 403) {
        toast.error({
          title: 'Cannot create event',
          description: errorMessage,
        });
      }

      setError(errorMessage);
      return;
    }
  };

  return <EditEventForm onSubmit={onSubmit} ApiError={error} />;
}
