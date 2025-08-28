import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function TrackDetailScreen() {
  const { id, trackId } = useLocalSearchParams<{ id: string; trackId: string }>();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'mock track',
        }}
      />
      <Text>Playlist id : |{id}| </Text>
      <Text>Track id : |{trackId}| </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
});
