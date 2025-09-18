import { SectionList } from 'react-native';
import { Heading } from '@/components/ui/heading';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';

type Props = {
  sections: PlaylistSection[];
};

export default function PlaylistList({ sections }: Props) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <PlaylistListItem playlist={item} />}
      renderSectionHeader={({ section }) => (
        <Heading className='mt-8 mb-2'>{section.title}</Heading>
      )}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}
