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
