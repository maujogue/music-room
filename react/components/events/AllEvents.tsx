import { useUserEvents } from '@/hooks/useUserEvents';
import { useProfile } from '@/contexts/profileCtx';
import EventList from '@/components/events/EventList';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import ErrorScreen from '@/components/generics/screens/ErrorScreen';
import EmptyState from '@/components/generics/screens/EmptyStateScreen';
import emptyPng from '@/assets/empty-events.png';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';

export default function AllEvents() {
  const { events, refetch, loading, error } = useUserEvents();
  const { profile } = useProfile();
  const router = useRouter();
  const handlePressCreateEvent = () => {
    router.push('/events/add');
  }

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (loading) return <LoadingSpinner text='Loading events' />;
  if (!profile) return <LoadingSpinner text='Events loading but profile error...' />;
  if (error) return <ErrorScreen error={error} />;
  if (!events) return <ErrorScreen error={"Impossible to fetch events"} />;

  const sections = [
    {
      title: '',
      data: events,
    },
  ];


  if (events.length === 0) {
    return (
      <Box>
        <EmptyState
          source={emptyPng}
          title="No events"
          subtitle="Nothing on the radar, only dust and empty bullets."
          text="What a sadness ! Let's create a supa-event as soon as possible !"
          onPressCta={handlePressCreateEvent}
        />
      </Box>
    );
  }

  return <EventList sections={sections} />;
}
