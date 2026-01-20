import React from 'react';
import { Modal, View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Motion,
  AnimatePresence,
  MotionComponentProps,
} from '@legendapp/motion';
import { ViewStyle } from 'react-native';
import Search from '@/components/search/Search';
import PlaylistListItem from '@/components/playlist/PlaylistListItem';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (playlist: Playlist) => void;
};

const { height: screenHeight } = Dimensions.get('window');

export default function PlaylistSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const modalHeight = screenHeight * 0.7;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType='none'
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <AnimatePresence>
          {isOpen && (
            <>
              <Pressable style={styles.backdrop} onPress={onClose} />
              <MotionView
                initial={{ y: modalHeight }}
                animate={{ y: 0 }}
                exit={{ y: modalHeight }}
                transition={{
                  type: 'timing',
                  duration: 300,
                }}
                style={[
                  styles.modalContent,
                  {
                    height: modalHeight,
                    paddingBottom: Math.max(insets.bottom, 16),
                  },
                ]}
              >
                <VStack style={styles.contentWrapper}>
                  <Search
                    placeholder='Search for playlists...'
                    showFilters={false}
                    defaultType='Playlists'
                    renderItemPlaylist={item => (
                      <PlaylistListItem
                        playlist={item}
                        onPress={() => {
                          onSelect(item);
                          onClose();
                        }}
                      />
                    )}
                  />

                  <Button
                    variant='solid'
                    action='secondary'
                    className='w-full mt-4'
                    onPress={onClose}
                  >
                    <ButtonText>Cancel</ButtonText>
                  </Button>
                </VStack>
              </MotionView>
            </>
          )}
        </AnimatePresence>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  contentWrapper: {
    flex: 1,
  },
});
