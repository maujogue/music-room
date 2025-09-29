import { useRouter } from 'expo-router';
import { useProfile } from '@/contexts/profileCtx';
import EditEventForm from '@/components/events/EditEventForm';
import { updateEvent } from '@/services/events';
import { useLocalSearchParams } from 'expo-router';
import { useEvent } from '@/hooks/useEvent';
import { Center } from '@/components/ui/center';
import { ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';

export default function EditEvent() {
  const router = useRouter();
  const { profile } = useProfile();
  const { eventId: eventId } = useLocalSearchParams();
  const { data, loading, error } = useEvent(eventId);

  const onSubmit = async (payload: EventPayload) => {
    if (!profile) {
      setError('Authentification error, try reconnect with Spotify please');
      return;
    }

    try {
      await updateEvent(eventId, {
        ...payload,
      });
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setError(`Error creating event: ${error}`);
      return;
    }
  };

  if (loading) {
    return (
      <Center>
        <ActivityIndicator size='large' />
      </Center>
    );
  }

  if (error) {
    return (
      <Center>
        <Text style={{ color: 'red' }}>{fetchError}</Text>
      </Center>
    );
  }

  if (!data) {
    return (
      <Center>
        <Text>Event not found</Text>
      </Center>
    );
  }


  return <EditEventForm
    initialValues={data ?? {}}
    onSubmit={onSubmit}
    ApiError={error}
  />;
}
