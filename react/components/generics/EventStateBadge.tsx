import { Badge, BadgeIcon } from '@/components/ui/badge';
import { AudioLines } from 'lucide-react-native';
import EventDoneBadge from './EventDoneBadge';

type Props = {
  event: MusicEvent;
};

export default function EventStateBadge({ event }: Props) {
  function isInProgress(event: MusicEvent) {
    if (event.done) {
      return false;
    }
    const eventDate = new Date(event.beginning_at);
    const now = new Date();
    return now > eventDate;
  }

  function isDone(event: MusicEvent) {
    return event.done;
  }

  if (isDone(event)) {
    return <EventDoneBadge />;
  }

  if (isInProgress(event)) {
    return (
      <Badge className='rounded-full h-10 w-10 bg-emerald-400/50 border border-emerald-200'>
        <BadgeIcon as={AudioLines} className='h-6 w-6 text-emerald-200' />
      </Badge>
    );
  }

  return null;
}
