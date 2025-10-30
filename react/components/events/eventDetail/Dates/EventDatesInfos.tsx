import { VStack } from '@/components/ui/vstack';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Calendar1Icon } from 'lucide-react-native';
import { parsePointCoordinates } from '@/utils/parsePointCoordinates';
import { MapPinIcon } from 'lucide-react-native';

interface Props {
  event: Pick<MusicEvent, 'beginning_at'>;
  coordinates?: Coordinates;
}

export default function EventDatesInfos({
  event,
  coordinates,
}: Props) {
  if (!event.beginning_at) {
    return null;
  }

  const startDate = new Date(event.beginning_at);
  const startFull = startDate.toLocaleString();

  return (
    <VStack className='justify-between pb-1'>
      <Badge size='md' className='rounded-xl h-6'>
        <BadgeIcon as={Calendar1Icon} size='lg' />
        <BadgeText className='pl-1 font-bold'>{startFull}</BadgeText>
      </Badge>
      {coordinates && (
        <Badge size='md' action='muted' className='rounded-full h-6'>
          <BadgeIcon as={MapPinIcon} size='lg' />
          <BadgeText className='pl-1'>
            {coordinates.lat.toFixed(5)}, {coordinates.long.toFixed(5)}
          </BadgeText>
        </Badge>
      )}
    </VStack>
  );
}
