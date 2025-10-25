import EventDetail from '@/components/events/EventDetail';
import { ProfileProvider } from '@/contexts/profileCtx';

export default function EventDetailScreen() {
  return (
    <ProfileProvider>
      <EventDetail />
    </ProfileProvider>
  );
}