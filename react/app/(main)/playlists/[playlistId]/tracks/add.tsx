import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import Search from '@/components/search/Search';
import useAddTrack from '@/hooks/useAddTrack';
import TrackListItem from '@/components/track/TrackListItem';

export default function AddTrack() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { onSwipeableOpen, renderLeftAction, renderRightAction } =
    useAddTrack(playlistId);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView>
        <Search
          placeholder='Search for tracks to add to your playlist...'
          showFilters={false}
          defaultType='Tracks'
          renderItemTrack={item => (
            <TrackListItem
              renderLeftAction={() => renderLeftAction()}
              renderRightAction={() => renderRightAction()}
              onSwipeableOpen={() => onSwipeableOpen(item.id)}
              track={item}
              key={item.id}
            />
          )}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
