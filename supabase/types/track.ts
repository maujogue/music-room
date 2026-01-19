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

interface SpotifyTrack {
  album: SpotifyAlbum;
  artists: { name: string; id: string; uri: string }[];
  available_markets?: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids?: Record<string, string>;
  external_urls: { spotify: string };
  href: string;
  id: string | null; // null if local track
  is_local?: boolean;
  is_playable?: boolean;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: 'track' | string;
  uri: string;
};

export interface SpotifyCurrentlyPlayingTrack {
  device: {
    id: string;
    is_active: boolean;
    is_private_session: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number;
    supports_volume: boolean;
  };
  repeat_state: string;
  shuffle_state: boolean;
  context: {
    type: string;
    href: string;
    external_urls: {
      spotify: string;
    };
    uri: string;
  } | null;
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyTrack | null;
  currently_playing_type: string;
  actions: {
    interrupting_playback: boolean;
    pausing: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
    toggling_repeat_context: boolean;
    toggling_shuffle: boolean;
    toggling_repeat_track: boolean;
    transferring_playback: boolean;
  };
};
