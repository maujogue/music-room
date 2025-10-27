import { SectionList, ScrollView } from 'react-native';
import { Heading } from '@/components/ui/heading';
import EventListItem from '@/components/events/EventListItem';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import FloatButton from '@/components/generics/FloatButton';
import { Radar } from 'lucide-react-native';

type Props = {
  sections: MusicEventSection[];
};

export default function EventList({ sections }: Props) {
  const router = useRouter();
  const handlePressCreateEvent = () => {
    router.push('/events/add');
  };

  const handlePressEventRadar = () => {
    router.push('/events/radar');
  };
  return (
    <>
      <ScrollView className='px-4'>
        <SectionList
          sections={sections}
          keyExtractor={item => `item-${item.event.id}-${Math.random()}`}
          renderItem={({ item }) => (
            <EventListItem event={item.event} owner={item.owner} />
          )}
          renderSectionHeader={({ section }) => (
            <Heading>{section.title}</Heading>
          )}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          className='w-full'
        />
      </ScrollView>
      <FloatButton onPress={handlePressCreateEvent} icon={Plus} />
      <FloatButton onPress={handlePressEventRadar} classNames="absolute bottom-20 border-2 border-pink-500 right-4 rounded-full p-4 blurred-bg" icon={Radar} />
    </>
  );
}
