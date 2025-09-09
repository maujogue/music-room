import { SectionList, Pressable } from 'react-native';
import { Heading } from '@/components/ui/heading';
import { Link } from 'expo-router';
import EventListItem from '@/components/events/EventListItem';

type Props = {
  sections: MusicEventSection[];
};

export default function EventList({ sections }: Props) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <Link
          href={{
            pathname: '/(main)/events/[eventId]',
            params: { eventId: item.id },
          }}
          asChild
        >
          <Pressable>
            <EventListItem event={item} />
          </Pressable>
        </Link>
      )}
      renderSectionHeader={({ section }) => (
        <Heading className='mt-8 mb-2'>{section.title}</Heading>
      )}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}
