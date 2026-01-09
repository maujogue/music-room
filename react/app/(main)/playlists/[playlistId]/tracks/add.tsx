import { StyleSheet, Dimensions, View, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Search from '@/components/search/Search';
import useAddTrack from '@/hooks/useAddTrack';
import TrackListItem from '@/components/track/TrackListItem';

const { height: screenHeight } = Dimensions.get('window');

export default function AddTrack() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { onSwipeableOpen, renderLeftAction } = useAddTrack(playlistId);
  const router = useRouter();

  return (
    <GestureHandlerRootView style={styles.container}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Search
            placeholder='Search for tracks to add to your playlist...'
            showFilters={false}
            defaultType='Tracks'
            noHorizontalPadding={true}
            renderItemTrack={item => (
              <TrackListItem
                renderLeftAction={() => renderLeftAction()}
                onSwipeableOpen={() => onSwipeableOpen(item.id)}
                track={item}
                key={item.id}
              />
            )}
          />
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentWrapper: {
    maxHeight: screenHeight * 0.7,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});
