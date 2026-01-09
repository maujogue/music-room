import type { PlaylistRow } from './playlist.ts';

export type EventRole = 'owner' | 'member' | 'inviter' | 'voter' | 'collaborator' | null;

export interface EventResponse {
  event: Event
  owner: SpotifyOwner;
  location?: EventLocation;
  members: EventMember[];
  playlist?: PlaylistRow;
  user: {
    role: EventRole;
    can_edit: boolean;
    can_delete: boolean;
    can_invite: boolean;
    can_vote: boolean;
  };
};

export interface Event {
  id: string;
  name: string;
  image_url?: string;
  is_private: boolean;
  everyone_can_vote: boolean;
  description?: string;
  playlist_id?: string;
  playlistId: string;
  beginning_at: string;
  spatio_licence: boolean;
  done: boolean;
}

export interface EventResponseReduced {
    id: string;
    name: string;
    image_url?: string;
    is_private: boolean;
    everyone_can_vote: boolean;
    description?: string;
    playlist_id?: string;
    playlistId: string;
    beginning_at: string;
    owner: SpotifyOwner;
}

export interface EventMember {
  id: string;
  event_id: string;
  user_id: string;
  joined_at: string;
  profile: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    music_genre?: string;
  };
  role: EventRole;
}

export interface SpotifyOwner {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Coordinates {
  lat: number;
  long: number;
}

export interface EventLocation {
  coordinates?: Coordinates;
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface EventPayload {
  name: string;
  image_url?: string;
  is_private: boolean;
  everyone_can_vote: boolean;
  done: boolean;
  spatio_licence: boolean;
  description?: string;
  playlist_id?: string;
  beginning_at: string;
  playlistId: string;
	location?: EventLocationPayload;
}

export interface EventLocationPayload {
  coordinates?: Coordinates;
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface EventRadarResult {
  radar: {
    coordinates: Coordinates;
    dist: Number;
    venuename: string;
  }
  event: Event;
  owner: SpotifyOwner;
}

export interface EventRadarFromDb {
  id: string
  name: string
  beginning_at: string
  image_url: string
  owner_id: string
  owner_name: string
  owner_avatar_url: string
  long: number
  lat: number
  dist_meters: number
  done: boolean
  spatio_licence: boolean
}