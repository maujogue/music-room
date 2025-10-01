import { SectionList, ScrollView } from 'react-native';
import { Heading } from '@/components/ui/heading';
import EventListItem from '@/components/events/EventListItem';
import AddEventItem from '@/components/events/AddEventItem';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import FloatButton from '@/components/generics/FloatButton';

type Props = {
  sections: MusicEventSection[];
};

export default function EventList({ sections }: Props) {
  const router = useRouter();
  const handlePressCreateEvent = () => {
    router.push('/events/add');
  };

  return (
    <>
    <ScrollView>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <EventListItem event={item} />}
        renderSectionHeader={({ section }) => (
          <Heading>{section.title}</Heading>
        )}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </ScrollView>
    <FloatButton onPress={handlePressCreateEvent} icon={Plus} />
    </>
  );
}
