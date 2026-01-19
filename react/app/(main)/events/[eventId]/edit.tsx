import { useRouter } from 'expo-router';
import { useProfile } from '@/contexts/profileCtx';
import EditEventForm from '@/components/events/EditEventForm';
import { updateEvent } from '@/services/events';
import { useLocalSearchParams } from 'expo-router';
import { useEvent } from '@/hooks/useEvent';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import { useAppToast } from '@/hooks/useAppToast';

export default function EditEvent() {
  const router = useRouter();
  const { profile } = useProfile();
  const { eventId: eventId } = useLocalSearchParams();
  const id = Array.isArray(eventId) ? eventId[0] : eventId;
  const { data, loading, error, setError } = useEvent(id);
  const toast = useAppToast();

  const onSubmit = async (payload: MusicEventPayload) => {
    if (!profile) {
      setError('Authentification error, try reconnect with Spotify please');
      return;
    }

    try {
      await updateEvent(id, {
        ...payload,
      });
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error: any) {
      console.error('Error editing event:', error);
      const errorStatus = error?.status;
      const errorMessage = error?.message || `Error editing event: ${error}`;
      
      // Show toast for duplicate (409) or forbidden (403) errors
      if (errorStatus === 409 || errorStatus === 403) {
        toast.error({
          title: 'Cannot update event',
          description: errorMessage,
        });
      }
      
      setError(errorMessage);
      return;
    }
  };

  if (loading) {
    return <LoadingSpinner text='Loading event...' />;
  }
  if (error) {
    return <ErrorScreen error={error} />;
  }
  if (!data) {
    return <ErrorScreen error={'impossible to retrieve event data yet.'} />;
  }

  return (
    <EditEventForm
      initialValues={data ?? {}}
      onSubmit={onSubmit}
      ApiError={error ?? ''}
    />
  );
}
