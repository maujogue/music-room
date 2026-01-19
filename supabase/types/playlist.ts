// types.ts - Mettre à jour les types
export interface CreatePlaylistPayload {
  name: string;
  description?: string;
  cover_url?: string;
  is_private?: boolean;
  is_collaborative?: boolean;
};

export type UpdatePlaylistPayload = Partial<CreatePlaylistPayload>;

export interface PlaylistResponse {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  owner_id: string;
  is_private: boolean;
  is_collaborative: boolean;
  can_invite: boolean;
  created_at: string;
  updated_at: string;
  is_spotify_sync?: boolean;
  spotify_id?: string;
  tracks: PlaylistTrack[];
  collaborators: PlaylistCollaborator[];
  members: PlaylistMember[];
  owner: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  user?: {
    can_edit: boolean;
    can_invite: boolean;
    is_following: boolean;
    role: 'owner' | 'collaborator' | 'member' | 'none';
  };
};

export interface PlaylistRow {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  is_collaborative: boolean;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
  is_spotify_sync?: boolean;
  spotify_id?: string;
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_id: string;
  added_at: string;
  added_by: string;
}

export interface PlaylistCollaborator {
  id: string;
  playlist_id: string;
  user_id: string;
  added_at: string;
  added_by: string;
  role: 'collaborator' | 'owner';
}

export interface PlaylistMember {
  id: string;
  playlist_id: string;
  user_id: string;
  added_at: string;
  added_by: string;
}

export interface SpotifyPlaylistItemsResponse {
  href: string;
  items: SpotifyPlaylistItem[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface SpotifyPlaylistItem {
  added_at: string;
  added_by: {
    id: string;
  };
  track: SpotifyTrackDetails;
}

export interface SpotifyTrackDetails {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  uri: string;
}

export interface PlaylistWithDetails extends PlaylistResponse {
  tracks: (PlaylistTrack & { details: SpotifyTrackDetails | null })[];
}

export interface SpotifyPlaylistResponse {
  id: string;
  name: string;
  description: string;
  public: boolean;
  collaborative: boolean;
  type: string;
  tracks: {
    href: string;
    total: number;
    items: SpotifyPlaylistItem[];
  };
}
