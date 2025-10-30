import { Badge, BadgeIcon } from '@/components/ui/badge';
import EventDoneBadge from './EventDoneBadge';
import { AudioLines, BadgeCheck } from 'lucide-react-native';

type Props = {
  event: MusicEvent;
};

export default function EventStateBadge({event} : Props) {

  function isInProgress(event: MusicEvent) {
    if (event.done) { return false }
    const eventDate = new Date(event.beginning_at);
    const now = new Date();
    return now > eventDate;
  }

  function isDone(event: MusicEvent) {
    return event.done
  }

  if (isDone(event)) {
    return (
    <Badge className='rounded-full h-10 w-10 bg-neutral-950/30 border border-neutral-950/40'>
      <BadgeIcon as={BadgeCheck} className='h-6 w-6 text-white' />
    </Badge>
  );
  }
  
  
  if (isInProgress(event)) {
    return (
      <Badge className='rounded-full h-10 w-10 bg-emerald-400/30 border border-emerald-400/40'>
        <BadgeIcon as={AudioLines} className='h-6 w-6 text-emerald-400' />
      </Badge>
    );
  }

  return null;
}
