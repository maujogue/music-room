import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Calendar1Icon } from 'lucide-react-native';
import { parsePointCoordinates } from '@/utils/parsePointCoordinates';
import { MapPinIcon } from 'lucide-react-native';

interface Props {
  event: Pick<MusicEvent, 'beginning_at'>;
  coordinates?: string
}

export default function EventDatesInfos({ event, coordinates = "(1.123456, 25.987654)" }: Props) {
  if (!event.beginning_at) {
    return null;
  }

  const startDate = new Date(event.beginning_at);
  const startFull = startDate.toLocaleString();

  const parsedCoordinates = coordinates
    ? parsePointCoordinates(coordinates)
    : null;

  return (
    <VStack space='sm'>
      <Badge size='md' className='rounded-xl h-6'>
        <BadgeIcon as={Calendar1Icon} size='lg' />
        <BadgeText className='pl-1 font-bold'>{startFull}</BadgeText>
      </Badge>
      {parsedCoordinates && (
        <Badge
          size='md'
          action='muted'
          className='rounded-full h-6'
        >
          <BadgeIcon as={MapPinIcon} size='lg' />
          <BadgeText className='pl-1'>
            {parsedCoordinates.y.toFixed(5)}, {parsedCoordinates.x.toFixed(5)}
          </BadgeText>
        </Badge>
      )}
    </VStack>
  );
}
