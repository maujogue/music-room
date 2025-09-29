import { SectionList, ScrollView } from 'react-native';
import AddPlaylistItem from '@/components/playlist/AddPlaylistItem';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';
import { useRouter } from 'expo-router';

type Props = {
  sections: PlaylistSection[];
};

export default function PlaylistList({ sections }: Props) {
  const router = useRouter();
  const onPlaylistPress = () => {
    router.push('(main)/playlists/add/');
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <AddPlaylistItem onPress={onPlaylistPress} title="Add Playlist" />
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
