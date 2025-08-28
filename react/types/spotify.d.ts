export interface SpotifyImage {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyOwner {
  display_name: string;
  id: string;
  href: string;
  type: 'user';
  uri: string;
}

export interface SpotifyPlaylist {
  collaborative: boolean;
  description: string | null;
  external_urls: { spotify: string };
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  owner: SpotifyOwner;
  primary_color: string | null;
  public: boolean | null;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
  };
  type: 'playlist';
  uri: string;
}

export interface SpotifyTrack {
  album: {
    album_type: string;
    artists: { name: string; id: string; uri: string }[];
    external_urls: { spotify: string };
    href: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    release_date: string;
    total_tracks: number;
    type: string;
    uri: string;
  };
  artists: { name: string; id: string; uri: string }[];
  available_markets?: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids?: Record<string, string>;
  external_urls: { spotify: string };
  href: string;
  id: string;
  is_local?: boolean;
  is_playable?: boolean;
  name: string;
  popularity: number;
  preview_url?: string;
  track_number: number;
  type: string;
  uri: string;
}
