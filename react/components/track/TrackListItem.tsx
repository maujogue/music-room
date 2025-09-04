import { SpotifyTrack } from '@/types/spotify';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
  SharedValue,
} from 'react-native-reanimated';
import { useRef } from 'react';

type TrackListItemProps = {
  track?: SpotifyTrack;
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
        onSwipeableOpen={() => {
            if (onSwipeableOpen) {
                onSwipeableOpen();
            }
            setTimeout(() => {
                swipeableRef.current?.close();
            }, 500);
        }}
    >
    <Card className="flex-row gap-2 p-2">
      <Image source={getImage()} className="rounded-md h-[60px] w-[60px]" alt="Playlist avatar" />
      <VStack  className="pt-1">
        <Heading size='md' className='text-typography-800'>{track.name}</Heading>
        {track.artists && (
          <Text size='sm' className="text-typography-400">{track.artists[0].name}</Text>
        )}
      </VStack>
    </Card>
    </ReanimatedSwipeable>
  );
}
