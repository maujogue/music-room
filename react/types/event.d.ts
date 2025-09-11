type MusicEvent = {
  id: string;
  name: string;
  images: SpotifyImage[];
  owner: SpotifyOwner;
  isPublic: boolean;
  location: MusicEventLocation;
  // playlistId: string;
  startDate: string;
  endDate: string;
};

type Coordinates = {
  lat: number;
  long: number;
};

type MusicEventLocation = {
  coordinates?: Coordinates;
  venueName?: string; // a name assigned to a specific location
  address?: string;
  city?: string;
  country?: string;
};

type MusicEventSection = {
  title: string;
  data: MusicEvent[];
};

type MusicEventPayload = {
  name: string;
};

type EventDateLabels = {
  start: { date: string; time?: string; full: string };
  end: { date: string; time?: string; full: string };
  rangeLabel: string;
  duration: { ms: number; minutes: number; hours: number; human: string };
  isSameDay: boolean;
  isCurrentYear: boolean;
  timezone: string;
  locale: string;
};
