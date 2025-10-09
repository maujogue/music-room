import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Calendar1Icon } from 'lucide-react-native';

interface Props {
  event: Pick<Event, 'beginning_at'>;
}

export default function EventDatesInfos({ event }: Props) {
  if (!event.beginning_at) {
    return null;
  }

  const startDate = new Date(event.beginning_at);
  const startFull = startDate.toLocaleString();

  return (
    <VStack space='xs'>
      <Badge size='md' action='info' className='rounded-xl h-6 mb-2'>
        <BadgeIcon as={Calendar1Icon} size='lg' />
        <BadgeText className='pl-1 font-bold'>{startFull}</BadgeText>
      </Badge>

      <HStack space='sm' className='pl-4 items-center'>
        <Badge
          size='sm'
          action='muted'
          className='rounded-full bg-indigo-200 w-12'
        >
          <BadgeText size='sm' className='capitalize'>
            on
          </BadgeText>
        </Badge>
        <Text size='xs' className='font-semibold'>
          {startFull}
        </Text>
      </HStack>
    </VStack>
  );
}
