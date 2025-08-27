import React from 'react';
import { StyleSheet, Pressable, Text, SafeAreaView, View } from 'react-native';
import { Link } from 'expo-router';
import { MOCK_TRACKS } from '@/mocks/mockTracks';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackListItem from '@/components/ui/track/TrackListItem';



export default function TrackList() {

  const mocks = MOCK_TRACKS

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlatList
          data={mocks}
          renderItem={({item}) => 
            (
            <>
              <Link href={{
                pathname: "/(main)/tracks/[id]",
                params: {id: item.id},
              }} asChild>
                <Pressable>
                    <TrackListItem track={item} />
                </Pressable>
              </Link>
            </>
            )}
          keyExtractor={item => item.id}
        />
      </GestureHandlerRootView>)

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
});
