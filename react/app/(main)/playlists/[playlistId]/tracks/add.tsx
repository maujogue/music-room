import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import Search from '@/components/search/Search';
import useAddTrack from '@/hooks/useAddTrack';
import TrackListItem from '@/components/track/TrackListItem';
import { Box } from '@/components/ui/box';

export default function AddTrack() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { onSwipeableOpen, renderLeftAction } = useAddTrack(playlistId);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Box className='flex-1 bg-white'>
        <Search
          placeholder='Search for tracks to add to your playlist...'
          showFilters={false}
          defaultType='Tracks'
          noHorizontalPadding={false}
          renderItemTrack={item => (
            <TrackListItem
              renderLeftAction={() => renderLeftAction()}
              onSwipeableOpen={() => onSwipeableOpen(item.id)}
              track={item}
              key={item.id}
            />
          )}
        />
      </Box>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
