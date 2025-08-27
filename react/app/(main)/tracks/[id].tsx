import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';


export default function TrackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Stack.Screen
          options={{
            title: "mock track",
          }}
        />
      <Text>Detail track id : |{id}| </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
});
