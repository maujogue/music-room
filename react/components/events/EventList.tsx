import { SectionList, ScrollView } from 'react-native';
import { Heading } from '@/components/ui/heading';
import EventListItem from '@/components/events/EventListItem';
import AddEventItem from '@/components/events/AddEventItem';
import { useRouter } from 'expo-router';

type Props = {
  sections: MusicEventSection[];
};

export default function EventList({ sections }: Props) {
  const router = useRouter();
  const handlePressCreateEvent = () => {
    router.push('/events/add');
  };

  return (
    <ScrollView>
      <AddEventItem onPress={handlePressCreateEvent} title='Create event' />
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
  );
}
