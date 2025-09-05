// import { useUserEvents } from '@/hooks/useUserEvents';
import { Text } from '@/components/ui/text';
import { Center } from '@/components/ui/center';
import { Heading } from '../ui/heading';
import { Button, ButtonText } from '../ui/button';
import { useRouter } from 'expo-router';

export default function AllEvents() {
  // const { events, loading, error } = useUserEvents();

  const router = useRouter();

  const goToEventDetail = (eventId: string) => {
    router.push(`(main)/events/${eventId}`);
  };

  return (
    <Center className='flex-1'>
      <Heading>All Events Screen</Heading>
      <Text>Lists My Events + Events Following</Text>
      <Button onPress={() => goToEventDetail('ijiF5A8K9Ei')} className='mt-16'>
        <ButtonText>Go to event detail</ButtonText>
      </Button>
    </Center>
  );
}
