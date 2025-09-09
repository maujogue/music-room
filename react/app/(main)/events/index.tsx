import AllEvents from '@/components/events/AllEvents';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventsHome() {
  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 12 }} edges={['top']}>
      <AllEvents />
    </SafeAreaView>
  )
}
