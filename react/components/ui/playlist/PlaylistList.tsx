import React from 'react';
import { Text, SectionList, StyleSheet } from 'react-native';
import PlaylistListItem from '@/components/ui/playlist/PlaylistListItem';
import { PlaylistSection } from '@/types/playlist';


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
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
});
