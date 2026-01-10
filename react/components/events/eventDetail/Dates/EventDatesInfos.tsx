import { VStack } from '@/components/ui/vstack';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Calendar1Icon } from 'lucide-react-native';
import { MapPinIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

interface Props {
  event: Pick<MusicEvent, 'beginning_at'>;
  coordinates?: Coordinates;
  minimal?: boolean;
}

export default function EventDatesInfos({ event, coordinates, minimal }: Props) {
  if (!event.beginning_at) {
    return null;
  }

  const startDate = new Date(event.beginning_at);
  
  if (minimal) {
      // Format: MMM d, HH:mm
      const dateStr = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const timeStr = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      return (
         <View className="flex-row items-center">
            <Calendar1Icon size={14} color="#ec4899" />
            <Text className="text-primary-500 font-bold text-xs ml-1">
                {dateStr} • {timeStr}
            </Text>
         </View>
      );
  }

  const startFull = startDate.toLocaleString();

  return (
    <VStack className='justify-between pb-1'>
      <Badge size='md' className='rounded-xl h-6'>
        <BadgeIcon as={Calendar1Icon} size='lg' />
        <BadgeText className='pl-1 font-bold'>{startFull}</BadgeText>
      </Badge>
      {coordinates && coordinates.lat && coordinates.long && (
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
