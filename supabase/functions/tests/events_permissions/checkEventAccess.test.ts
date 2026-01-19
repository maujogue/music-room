import {
  assertRejects,
  assertStrictEquals,
  assertThrows,
} from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { HTTPException } from "https://deno.land/x/hono@v3.2.3/http-exception.ts";
import { checkEventAccess } from "../../../functions/events/permissions.ts";

import {
  Coordinates,
  EventLocation,
  EventMember,
  EventResponse,
  EventRole,
  SpotifyOwner,
} from "@event";
import type { PlaylistRow } from "@playlist";

const mockEventRole: EventRole = "member";

const mockCoord: Coordinates = {
  lat: 5,
  long: 5,
};

const mockLocation: EventLocation = {
  coordinates: mockCoord,
  venueName: "venue",
  address: "30 rue du colonel Moutarde",
  city: "Paris",
  country: "France",
};

const mockOwner: SpotifyOwner = {
  id: "owner123",
  name: "mike_owner",
  email: "miko@gmail.com",
  avatar_url: "",
};

const mockEventMember: EventMember = {
  id: "event_member1",
  event_id: "event123",
  user_id: "user123",
  joined_at: "",
  profile: {
    id: "profile1",
    name: "dom",
    email: "dom@gmail.com",
    avatar_url: "",
    music_genre: "",
  },
  role: mockEventRole,
};

const mockPlaylistRow: PlaylistRow = {
  id: "playlist_row1",
  name: "pl",
  description: "",
  is_private: true,
  is_collaborative: true,
  cover_url: null,
  created_at: "",
  updated_at: "",
  owner_id: "owner123",
  is_spotify_sync: true,
  spotify_id: "",
};

const mockEvent: EventResponse = {
  event: {
    id: "event123",
    name: "the_event",
    image_url: "",
    is_private: false,
    everyone_can_vote: false,
    description: "",
    playlist_id: "",
    playlistId: "",
    beginning_at: "",
    spatio_licence: false,
    done: false,
  },
  owner: mockOwner,
  location: mockLocation,
  members: [mockEventMember],
  playlist: mockPlaylistRow,
  user: {
    role: mockEventRole,
    can_edit: true,
    can_delete: true,
    can_invite: true,
    can_vote: true,
  },
};

Deno.test("throws 404 if playlist is null", () => {
  assertThrows(
    () => checkEventAccess(null as any, "user123"),
    HTTPException,
    "Event not found",
  );
});

Deno.test("returns event if it is public", async () => {
  const result = await checkEventAccess(mockEvent as any, "user123");
  assertStrictEquals(result, mockEvent);
});

Deno.test("throws 403 if access is denied", async () => {
  mockEvent.event.is_private = true;
  assertRejects(
    async () => checkEventAccess(mockEvent as any, "user123"),
    HTTPException,
    "Access denied to private event",
  );
});
