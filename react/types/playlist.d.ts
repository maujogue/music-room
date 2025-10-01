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
type PlaylistOwner = {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
};

type PlaylistCollaborator = {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  role: 'owner' | 'collaborator' | 'viewer';
  added_at: string;
};

type PlaylistMember = {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  added_at: string;
};

type PlaylistTrack = {
  spotify_id: string;
  position: number;
  added_by: string;
  added_at: string;
  details: SpotifyTrack;
};

type Playlist = {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  is_collaborative: boolean;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  user: {
    role: string | null;
    can_edit: boolean;
    can_invite: boolean;
    is_following: boolean;
  };
  owner: PlaylistOwner;
  collaborators: PlaylistCollaborator[];
  members: PlaylistMember[];
  tracks: PlaylistTrack[];
  is_spotify_sync: boolean;
  spotify_id: string | null;
};
