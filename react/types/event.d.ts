// Note: naming 'Event' would conflict with built-in DOM Event
type UserRole = 'owner' | 'member' | 'voter' | 'inviter' | 'collaborator';

type MusicEvent = {
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

  /* format ISO 8601 (ex. "2025-09-15T19:30:00Z") */
  beginning_at: string;
};

type MusicEventFetchResult = {
  event: MusicEvent;
  location: MusicEventLocation;
  members: EventUser[];
  owner: UserInfo;
  playlist: Playlist;
  user?: EventUser;
};

type EventUser = {
  // Info: UserInfo;
  role: UserRole;
  can_delete: boolean;
  can_edit: boolean;
  can_invite: boolean;
  can_vote: boolean;
  profile: UserInfo;
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
  data: MusicEventFetchResult[];
};

type MusicEventPayload = {
  name: string;

  // TODO : complete here from backend shape
  // id: string;
  name: string;
  image_url?: string;
  // owner: SpotifyOwner;
  is_private: boolean;
  everyone_can_vote: boolean;
  description?: string;
  playlist_id?: string;
  // playlistId: string;
  location: MusicEventLocation;

  /* format ISO 8601 (ex. "2025-09-15T19:30:00Z") */
  beginning_at: string;
};

type EventDateLabels = {
  start: { date: string; time?: string; full: string };
  isCurrentYear: boolean;
  timezone: string;
  locale: string;
};

type TrackVote = {
  eventId: string;
  eventName?: string;
  trackId: string;
  voteCount: number;
  voters: string[];
};
