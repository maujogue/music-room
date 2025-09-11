import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Calendar1Icon, TimerIcon } from 'lucide-react-native';
import { useEventDate } from '@/hooks/useEventDate';

interface Props {
  event: Pick<MusicEvent, 'startDate' | 'endDate'>;
}

export default function EventDatesInfos({ event }: Props) {
  if (!event.startDate || !event.endDate) {
    return null;
  }

  const { start, end, rangeLabel, duration } = useEventDate(
    event.startDate,
    event.endDate
  );

  return (
    <VStack space='xs'>
      <Badge size='md' action='info' className='rounded-xl h-6 mb-2'>
        <BadgeIcon as={Calendar1Icon} size='lg' />
        <BadgeText className='pl-1 font-bold'>{rangeLabel}</BadgeText>
      </Badge>
      <HStack space='sm' className='pl-4 items-center'>
        <Badge
          size='sm'
          action='muted'
          className='rounded-full bg-indigo-200 w-12'
        >
          <BadgeText size='sm' className='capitalize'>
            from
          </BadgeText>
        </Badge>
        <Text size='xs' className='font-semibold'>
          {start.full}
        </Text>
      </HStack>
      <HStack space='sm' className='pl-4 items-center'>
        <Badge
          size='sm'
          action='muted'
          className='rounded-full bg-indigo-200 w-12'
        >
          <BadgeText size='sm' className='capitalize'>
            to
          </BadgeText>
        </Badge>
        <Text size='xs' className='font-semibold'>
          {end.full}
        </Text>
      </HStack>
      <HStack className='justify-end mt-2'>
        <Badge size='md' action='info' className='rounded-xl h-6'>
          <BadgeIcon as={TimerIcon} size='lg' />
          <BadgeText className='pl-1 font-bold'>{duration.human}</BadgeText>
        </Badge>
      </HStack>
    </VStack>
  );
}
