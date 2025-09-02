import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { } from 'react-native';
import { SearchBar } from '@/components/ui/searchbar'
import { searchApi } from '@/services/search';
import { addItemToPlaylist } from '@/services/playlist';
import { SpotifyTrack } from '@/types/spotify';
import { Icon } from '@/components/ui/icon';
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
import { TrackListItem } from '@/components/track/TrackListItem';

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
            const res = await searchApi(query, 'track');
            if (res.tracks && res.tracks.items) {
                setResults(res.tracks.items);
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
                <Icon name="add" size={24} color="#fff" />
            </Reanimated.View>
        );
    }

    const ListItem = ({ item }: { item: SpotifyTrack }) => {
        const swipeableRef = useRef<SwipeableMethods>(null);

        return (
            <ReanimatedSwipeable
                ref={swipeableRef}
                renderLeftActions={(prog, drag) => LeftAction(prog, drag, item)}
                leftThreshold={75}
                onSwipeableOpen={() => {
                    handlePress(item.id);
                    setTimeout(() => {
                        swipeableRef.current?.close();
                    }, 500);
                }}
            >
                <View style={styles.itemContainer}>
                    <Image
                        source={{ uri: item.album.images[0]?.url }}
                        style={styles.albumImage}
                    />
                    <View style={styles.trackInfo}>
                        <Text style={styles.trackName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={styles.artistName} numberOfLines={1}>
                            {item.artists?.map(a => a.name).join(', ')}
                        </Text>
                        <Text style={styles.albumName} numberOfLines={1}>
                            {item.album?.name}
                        </Text>
                    </View>
                </View>
            </ReanimatedSwipeable>
        );
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                </View>
                <FlatList
                    data={results}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <ListItem item={item} />}
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        </GestureHandlerRootView>
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
