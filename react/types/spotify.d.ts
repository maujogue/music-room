type SpotifyImage = {
  url: string;
  height?: number;
  width?: number;
}

type SpotifyOwner = {
  display_name: string;
  id: string;
  href: string;
  type: 'user';
  uri: string;
}

type SpotifyPlaylist = {
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

type SpotifyTrack = {
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
  id: string | null; // null if local track
  is_local?: boolean;
  is_playable?: boolean;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: 'track' | string;
  uri: string;
}

type SpotifyTrackWithKey = SpotifyTrack & {
  __key: string;
  __added_at: string | null;
};

type SpotifyEpisode = { type: 'episode'; id: string; uri: string; name: string };

type PlaylistItem = {
  added_at: string | null;
  is_local: boolean;
  track: SpotifyTrack | SpotifyEpisode | null;
};

type PlaylistItemsResponse = {
  href: string;
  items: PlaylistItem[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};


