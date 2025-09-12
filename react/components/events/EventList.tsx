import { SectionList } from 'react-native';
import { Heading } from '@/components/ui/heading';
import EventListItem from '@/components/events/EventListItem';

type Props = {
  sections: MusicEventSection[];
};

export default function EventList({ sections }: Props) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <EventListItem event={item} />}
      renderSectionHeader={({ section }) => (
        <Heading className='mt-8 mb-2'>{section.title}</Heading>
      )}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}
