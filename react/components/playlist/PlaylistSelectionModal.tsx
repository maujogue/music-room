import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import Search from '@/components/search/Search';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';
import { Button, ButtonIcon } from '@/components/ui/button';
import { CloseIcon } from '@/components/ui/icon';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (playlist: Playlist) => void;
};

export default function PlaylistSelectionModal({ isOpen, onClose, onSelect }: Props) {
  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button variant="outline" size="sm" onPress={onClose}>
            <ButtonIcon as={CloseIcon} />
          </Button>
        </View>

        <Search
          placeholder="Search for playlists..."
          showFilters={false}
          defaultType="Playlists"
          renderItemPlaylist={(item) => (
            <PlaylistListItem
              playlist={item}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            />
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
