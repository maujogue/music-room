import { useEffect, useState } from 'react';
import { SpotifyTrack } from '@/types/spotify';
import { getCurrentUserCurrentlyPlayingTrack } from '@/services/player';


export function usePlayer() {
    const [track, setTrack] = useState<SpotifyTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
    const run = async () => {
        setError(null);
        const data = await getCurrentUserCurrentlyPlayingTrack();
        if (!data || !data.item) {
            return;
        }
        setTrack([data.item]);
        setIsPlaying(data.is_playing);
    };

    run();
    return () => {
        cancelled = true;
    };
    }, []);

    return { track, isPlaying, error };
}
