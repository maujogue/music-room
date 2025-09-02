import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SearchBar } from '@/components/ui/searchbar'
import { searchApi } from '@/services/search';
import { SpotifyTrack } from '@/types/spotify';
import { Image } from 'react-native';

export default function AddTrack() {
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

    return (
        <View style={{ flex: 1, alignItems: 'center', padding: 24 }}>
            <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
            />
            <ScrollView style={{ width: '100%' }}>
                {results.map((track, idx) => (
                    <View key={track.id || idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <Image source={{ uri: track.album.images[0]?.url }} style={{ width: 50, height: 50, borderRadius: 6, marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 'bold' }}>{track.name}</Text>
                            <Text>{track.artists?.map(a => a.name).join(', ')}</Text>
                            <Text>{track.album?.name}</Text>
                        </View>
                    </View>
                ))}
                {results.length === 0 && (
                    <Text style={{ marginTop: 16, color: '#888' }}>Aucun résultat</Text>
                )}
            </ScrollView>
        </View>
    );
}
