export interface TrackResponse {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
    duration_ms: number;
    spotify_id: string;
    cover_url?: string;
}

export interface SpotifyTrackResponse {
    tracks: TrackResponse[];
    error: {
        status: number;
        message: string;
    } | null;
}

interface SpotifyArtist {
    id: string;
    name: string;
}
