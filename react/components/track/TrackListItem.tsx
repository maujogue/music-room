import { SpotifyTrack } from '@/types/spotify';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import {
  Swipeable,
  GestureHandlerRootView,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

type TrackListItemProps = {
  track: SpotifyTrack;
  onSwipeableOpen?: () => void;
  renderLeftAction?: (
    prog: SharedValue<number>,
    drag: SharedValue<number>,
    item: SpotifyTrack
  ) => React.JSX.Element;
  renderRightAction?: (
    prog: SharedValue<number>,
    drag: SharedValue<number>,
    item: SpotifyTrack
  ) => React.JSX.Element;
};

export default function TrackListItem({
  track,
  onSwipeableOpen,
  renderLeftAction,
  renderRightAction
}: TrackListItemProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);

  const getImage = () => {
    const hasValidImage =
      track &&
      track.album &&
      Array.isArray(track.album.images) &&
      track.album.images.length > 0 &&
      track.album.images[0]?.url;

    return {
      uri: hasValidImage
        ? track.album.images[0]!.url
        : 'https://picsum.photos/144',
    };
  };

  return (
    <ReanimatedSwipeable
        ref={swipeableRef}
        renderLeftActions={
            (prog, drag) => renderLeftAction ? renderLeftAction(prog, drag, track) : <></>
          }
        renderRightActions={
            (prog, drag) => renderRightAction ? renderRightAction(prog, drag, track) : <></>
          }
        leftThreshold={75}
        onSwipeableOpen={direction => {
            if (onSwipeableOpen) {
                onSwipeableOpen();
            }
            setTimeout(() => {
                swipeableRef.current?.close();
            }, 500);
        }}
    >
    <Card size="md" className="rounded-lg flex-row gap-2 mb-2 p-2">
      <Image source={getImage()} className="rounded-md h-[60px] w-[60px]" alt="Playlist avatar" />
      <VStack  className="pt-1">
        <Heading size='md' className='text-typography-800'>{track.name}</Heading>
        {track.artists && (
          <Text size='sm' className="text-typography-400">By {track.artists[0].name}</Text>
        )}
      </VStack>
    </Card>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    safeArea: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    list: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        width: screenWidth,
    },
    albumImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 12,
    },
    trackInfo: {
        flex: 1,
        marginRight: 12,
    },
    trackName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000',
        marginBottom: 2,
    },
    artistName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    albumName: {
        fontSize: 12,
        color: '#999',
    },
    addButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addAction: {
        flex: 1,
        backgroundColor: '#2db300',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
    },
    deleteButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    deleteText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
