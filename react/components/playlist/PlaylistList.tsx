import React from 'react';
import { Text, SectionList, StyleSheet, Pressable } from 'react-native';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';
import { PlaylistSection } from '@/types/playlist';
import { Link } from 'expo-router';

type Props = {
  sections: PlaylistSection[];
};

export default function PlaylistList({ sections }: Props) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <Link
          href={{
            pathname: '/(main)/playlists/[playlistId]',
            params: { playlistId: item.id },
          }}
          asChild
        >
          <Pressable>
            <PlaylistListItem playlist={item} />
          </Pressable>
        </Link>
      )}
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
