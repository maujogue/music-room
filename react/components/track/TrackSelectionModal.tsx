import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Motion,
  AnimatePresence,
  MotionComponentProps,
} from '@legendapp/motion';
import { ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Search from '@/components/search/Search';
import TrackListItem from '@/components/track/TrackListItem';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (trackId: string) => void;
  renderLeftAction?: (
    prog: any,
    drag: any,
    item: SpotifyTrack
  ) => React.JSX.Element;
};

const { height: screenHeight } = Dimensions.get('window');

export default function TrackSelectionModal({
  isOpen,
  onClose,
  onAddTrack,
  renderLeftAction,
}: Props) {
  const insets = useSafeAreaInsets();
  const modalHeight = screenHeight * 0.7;

  const handleSwipeableOpen = (trackId: string) => {
    onAddTrack(trackId);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType='none'
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.modalContainer}>
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
                  <ScrollView
                    keyboardShouldPersistTaps='handled'
                    style={styles.scrollView}
                  >
                    <Search
                      placeholder='Search for tracks to add to your playlist...'
                      showFilters={false}
                      defaultType='Tracks'
                      noHorizontalPadding={true}
                      renderItemTrack={item => (
                        <TrackListItem
                          renderLeftAction={renderLeftAction}
                          onSwipeableOpen={() => handleSwipeableOpen(item.id)}
                          track={item}
                          key={item.id}
                        />
                      )}
                    />
                  </ScrollView>

                  <View style={styles.buttonContainer}>
                    <Button
                      variant='solid'
                      action='secondary'
                      className='w-full mt-4'
                      onPress={onClose}
                    >
                      <ButtonText>Cancel</ButtonText>
                    </Button>
                  </View>
                </VStack>
              </MotionView>
            </>
          )}
        </AnimatePresence>
      </GestureHandlerRootView>
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
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 16,
  },
});
