type MusicEventFetchResult = {
  event: Event;
  location: MusicEventLocation;
  members: UserInfo[];
  owner: UserInfo;
};

type Event = {
  id: string;
  name: string;
  owner_id: string;
  owner: SpotifyOwner;
  isPublic: boolean;
  playlist: Playlist;
  is_private: boolean;
  everyone_can_vote: boolean;
  description?: string;
  image_url?: string;
  created_at: string;

  /* format ISO 8601 (ex. "2025-09-15T19:30:00Z") */
  beginning_at: string;
  ending_at: string;
};

type EventVote = {
  eventId: string;
  trackId: string;
  users: Guest[];
  number: number;
};

type Guest = Omit<UserInfo, 'email' | 'bio' | 'music_genre'>;

type Coordinates = {
  lat: number;
  long: number;
};

type MusicEventLocation = {
  id: string;
  event_id: string;
  coordinates?: string;
  venuename?: string;
  address?: string;
  complement?: string;
  city?: string;
  country?: string;
};

type MusicEventSection = {
  title: string;
  data: Event[];
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
