import { SectionList, ScrollView, View } from 'react-native';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';
import { Heading } from '@/components/ui/heading';

type Props = {
  sections: PlaylistSection[];
};

export default function PlaylistList({ sections }: Props) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
      className='px-4'
    >
      <View className='pt-6 pb-4'>
        <Heading size='3xl' className='font-bold text-typography-900'>
          Playlists
        </Heading>
      </View>
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
