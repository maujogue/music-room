import EventDetail from '@/components/events/EventDetail';
import ServerSocketListener from '@/components/ServerSocketListener';

export default function EventDetailScreen() {
  return (
    <>
      <EventDetail />
      <ServerSocketListener />
    </>
  );
}
