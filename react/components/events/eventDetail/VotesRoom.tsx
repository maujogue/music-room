import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Center } from '@/components/ui/center';

interface Props {
  eventId: string,
}

export default function VotesRoom({ eventId }: Props) {
  return (
    <Center className='flex-1'>
      <Heading>Event Detail Screen</Heading>
      <Heading size='sm' className='color-indigo-500'>Tab VOTES ROOM</Heading>
      <Text>Event detail for EventId : {eventId}</Text>
    </Center>
  );
}
