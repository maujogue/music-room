import EventDetail from '@/components/events/EventDetail';
import { PlayerProvider } from '@/contexts/PlayerCtx';

export default function EventDetailScreen() {
  return (
    <PlayerProvider>
      <EventDetail />
    </PlayerProvider>
  );
}
