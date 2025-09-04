import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { } from 'react-native';
import { SearchBar } from '@/components/ui/searchbar'
import { searchApi } from '@/services/search';
import { addItemToPlaylist } from '@/services/playlist';
import { SpotifyTrack } from '@/types/spotify';
import { Icon, AddIcon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image
} from "react-native";
import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  SharedValue,
} from 'react-native-reanimated';
import  TrackListItem  from '@/components/track/TrackListItem';
import { apiFetch } from '@/utils/apiFetch';
import { usePlaylistItems } from '@/hooks/usePlaylistItems';

const { width: screenWidth } = Dimensions.get('window');

export default function AddTrack() {
    const { playlistId, onTrackAdded } = useLocalSearchParams<{ playlistId: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SpotifyTrack[]>([]);

    useEffect(() => {
        if (!searchQuery) {
            setResults([]);
            return;
        }
        const timeout = setTimeout(() => {
            handleSearch(searchQuery);
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        try {
            const res: ApiResponse<SpotifyTrack[]> = await apiFetch<SpotifyTrack[]>(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/search?q=${encodeURIComponent(query)}&type=track`);
            if (res.data.tracks && res.data.tracks.items) {
                setResults(res.data.tracks.items);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error('Error searching tracks:', error);
            setResults([]);
        }
    };

    const handlePress = async (trackId: string) => {
        try {
            const res = await addItemToPlaylist(playlistId, [`spotify:track:${trackId}`]);
        } catch (error) {
            console.error('Error adding track to playlist:', error);
        }
    }

    function LeftAction(prog: SharedValue<number>, drag: SharedValue<number>, track: SpotifyTrack) {
        return (
            <Reanimated.View style={[styles.addAction]}>
                <Box
                    style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    width: '100%',
                    paddingLeft: 16
                    }}
                >
                    <Icon as={AddIcon} color="white" size={6} />
                </Box>
            </Reanimated.View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                </View>
                {results.map((item) => (
                    <TrackListItem
                        key={item.id}
                        track={item}
                        onPress={() => handlePress(item.id)}
                        renderLeftAction={(prog, drag) => LeftAction(prog, drag, item)}
                    />
                ))}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    addAction: {
        backgroundColor: '#2db300',
        flex: 1,
    }
});
