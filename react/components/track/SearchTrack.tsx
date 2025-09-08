import React, { useState, useEffect} from 'react';
import { } from 'react-native';
import { SearchBar } from '@/components/ui/searchbar'
import { addItemToPlaylist } from '@/services/playlist';
import { SpotifyTrack } from '@/types/spotify';
import { Icon, AddIcon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import {
  View,
  StyleSheet,
} from "react-native";
import  TrackListItem  from '@/components/track/TrackListItem';
import { apiFetch } from '@/utils/apiFetch';
import Reanimated from 'react-native-reanimated';


interface Props {
    playlistId: string;
}

export default function SearchTrack({ playlistId }: Props) {
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
            console.log('Adding track to playlist:', trackId);
            await addItemToPlaylist(playlistId, [`spotify:track:${trackId}`]);
        } catch (error) {
            console.error('Error adding track to playlist:', error);
        }
    }

    function LeftAction() {
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
        <>
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
                    onSwipeableOpen={() => handlePress(item.id)}
                    renderLeftAction={() => LeftAction()}
                />
            ))}
        </>
    );
}
const styles = StyleSheet.create({
    addAction: {
        backgroundColor: '#2db300',
        flex: 1,
    }
});
