type MusicEvent = {
  id: string;
  name: string;
  images: SpotifyImage[];
  owner: SpotifyOwner;
  isPublic: boolean;
  location: MusicEventLocation
  // playlistId: string;

  /* format ISO 8601 (ex. "2025-09-15T19:30:00Z") */
  beginning_at: string;
  ending_at: string;
};

type Coordinates = {
  lat: number;
  long: number;
}

type MusicEventLocation = {
  coordinates?: Coordinates;
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
}

type EventPayload = {
	event?: MusicEvent;
	location?: MusicEventLocation;
}
