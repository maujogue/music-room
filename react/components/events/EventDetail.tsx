import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Center } from '@/components/ui/center';

export default function EventDetail() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return (
    <Center className='flex-1'>
      <Heading>Event Detail Screen</Heading>
      <Text>Event detail for EventId : {eventId}</Text>
    </Center>
  );
}
