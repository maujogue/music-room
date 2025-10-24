export interface EventResponse {
  id: string;
  name: string;
  image_url?: string;
  owner: SpotifyOwner;
  is_private: boolean;
  everyone_can_vote: boolean;
  description?: string;
  playlist_id?: string;
  location: EventLocation;
  playlistId: string;

  /* format ISO 8601 (ex. "2025-09-15T19:30:00Z") */
  beginning_at: string;
};

interface Coordinates {
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
  description?: string;
  playlist_id?: string;
  beginning_at: string;
  playlistId: string;
	location?: MusicEventLocation;
}