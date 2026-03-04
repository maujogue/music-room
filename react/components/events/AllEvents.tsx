import { useUserEvents } from '@/hooks/useUserEvents';
import { useProfile } from '@/contexts/profileCtx';
import EventList from '@/components/events/EventList';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import EmptyState from '@/components/generics/screens/EmptyStateScreen';
import { useRouter } from 'expo-router';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Radar } from 'lucide-react-native';

export default function AllEvents() {
  const { events, refetch, loading, error } = useUserEvents();
  const { profile } = useProfile();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handlePressCreateEvent = () => {
    router.push('/events/add');
  };

  const handlePressEventRadar = () => {
    router.push('/events/radar');
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (loading) return <LoadingSpinner text='Loading events' />;
  if (!profile)
    return <LoadingSpinner text='Events loading but profile error...' />;
  if (error) return <ErrorScreen error={error} />;
  if (!events) return <ErrorScreen error={'Impossible to fetch events'} />;

  const sections = [
    {
      title: '',
      data: events,
    },
  ];

  const radarEventButton = () => {
    return (
      <Button
        size='lg'
        className='rounded-full bg-primary-500/70 w-20 h-20 p-3.5'
        action='primary'
        onPress={handlePressEventRadar}
      >
        <ButtonIcon size='xl' className='w-14 h-14' as={Radar} />
      </Button>
    );
  };

  if (events.length === 0) {
    return (
      <EmptyState
        title='No Events Yet'
        subtitle='Time to create your first event!'
        text='Start organizing amazing music events and invite your friends to join the fun. You can also explore events near you with the radar.'
        onPressCta={handlePressCreateEvent}
        addedCTA={radarEventButton()}
      />
    );
  }

  return (
    <EventList
      sections={sections}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
