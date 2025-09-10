import SearchTrack from '@/components/track/SearchTrack';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';

export default function AddTrack() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView>
        <SearchTrack playlistId={playlistId} />
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
