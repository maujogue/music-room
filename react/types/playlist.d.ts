type PlaylistSection = {
  title: string;
  data: SpotifyPlaylist[];
};

type PlaylistPayload = {
  name: string;
  is_private?: boolean;
  is_collaborative?: boolean;
  description?: string;
};

// Playlist types for the new playlist system
export interface PlaylistOwner {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface PlaylistCollaborator {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  role: 'owner' | 'collaborator' | 'viewer';
  added_at: string;
}

export interface PlaylistMember {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  added_at: string;
}

export interface PlaylistTrack {
  spotify_id: string;
  position: number;
  added_by: string;
  added_at: string;
  details: SpotifyTrack;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  is_collaborative: boolean;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  owner: PlaylistOwner;
  collaborators: PlaylistCollaborator[];
  members: PlaylistMember[];
  tracks: PlaylistTrack[];
}
