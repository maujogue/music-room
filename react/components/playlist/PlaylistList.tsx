import { SectionList, ScrollView } from 'react-native';
import CreatePlaylistItem from '@/components/playlist/CreatePlaylistItem';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';

type Props = {
  sections: PlaylistSection[];
};

export default function PlaylistList({ sections }: Props) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <CreatePlaylistItem />
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PlaylistListItem playlist={item} />}
        stickySectionHeadersEnabled={false}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
}
