// import { useUserEvents } from '@/hooks/useUserEvents';
import { Text } from '@/components/ui/text';
import { useUserEvents } from '@/hooks/useUserEvents';
import { useProfile } from '@/contexts/profileCtx';
import EventList from '@/components/events/EventList';

export default function AllEvents() {
  const { events, loading, error } = useUserEvents();
  const { profile } = useProfile();

  if (loading) return <Text>Events loading...</Text>;
  if (!profile) return <Text>Events loading but profileError...</Text>;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;
  if (!events) return <Text>No event found</Text>;

  const sections: MusicEventSection[] = [
    {
      title: 'Subscribed events',
      data: events.filter(e => e.owner.id !== profile.id),
    },
    {
      title: 'My events',
      data: events.filter(e => e.owner.id == profile.id),
    },
  ];

  return <EventList sections={sections} />;
}
