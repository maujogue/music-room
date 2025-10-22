export interface EventResponse {
  id: string;
  name: string;
  image_url?: string;
  owner: SpotifyOwner;
  is_private: boolean;
  everyone_can_vote: boolean;
  description?: string;
  playlist_id?: string;
  location: MusicEventLocation;
  playlistId: string;

  /* format ISO 8601 (ex. "2025-09-15T19:30:00Z") */
  beginning_at: string;
};

interface Coordinates {
  lat: number;
  long: number;
}

interface MusicEventLocation {
  coordinates?: Coordinates;
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface EventPayload {
	event?: Event;
	location?: MusicEventLocation;
}
