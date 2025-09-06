type MusicEvent = {
  id: string;
  name: string;
  images: SpotifyImage[];
  owner: SpotifyOwner;
  isPublic: boolean;
  location: MusicEventLocation
  // playlistId: string;
};

type Coordinates = {
  lat: number;
  long: number;
}

type MusicEventLocation = {
  coordinates?: Coordinates;
  venueName?: string;  // a name assigned to a specific location
  address?: string;
  city?: string;
  country?: string;
}

type MusicEventSection = {
  title: string;
  data: MusicEvent[];
}

type MusicEventPayload = {
  name: string;
};
