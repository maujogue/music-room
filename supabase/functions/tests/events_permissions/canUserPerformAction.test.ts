import { assertStrictEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import type { PlaylistRow } from "@playlist";

import {
  canUserPerformAction,
  PERMISSIONS,
  ROLES,
} from "../../../functions/events/permissions.ts";

import {
  Coordinates,
  EventLocation,
  EventMember,
  EventResponse,
  EventRole,
  SpotifyOwner,
} from "@event";

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

Deno.test("READ_EVENT - public event - anyone can read", () => {
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.READ_EVENT, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.READ_EVENT, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.READ_EVENT, mockEvent),
    true,
  );
});

Deno.test("READ_EVENT - private event - only anonymous can read", () => {
  mockEvent.event.is_private = true;
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.READ_EVENT, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.READ_EVENT, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.READ_EVENT, mockEvent),
    false,
  );
});

Deno.test("VOTE - everyone can vote", () => {
  mockEvent.event.everyone_can_vote = true;
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.VOTE, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.VOTE, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.VOTE, mockEvent),
    true,
  );
});

Deno.test("VOTE - restricted vote", () => {
  mockEvent.event.everyone_can_vote = false;
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.VOTE, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.VOTE, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.INVITER, PERMISSIONS.VOTE, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.VOTE, mockEvent),
    true,
  );
});

Deno.test("DELETE_EVENT - only owner can delete", () => {
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_EVENT, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_EVENT, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.DELETE_EVENT, mockEvent),
    false,
  );
});

Deno.test("ADD_USER - public event - anyone can add", () => {
  mockEvent.event.is_private = false;
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.ADD_USER, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_USER, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_USER, mockEvent),
    true,
  );
});

Deno.test("ADD_USER - private event - only inviter/owner can add", () => {
  mockEvent.event.is_private = true;
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.ADD_USER, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_USER, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.VOTER, PERMISSIONS.ADD_USER, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.INVITER, PERMISSIONS.ADD_USER, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_USER, mockEvent),
    true,
  );
});

Deno.test("UNVOTE - everyone can vote => anyone can unvote", () => {
  mockEvent.event.everyone_can_vote = true;
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.UNVOTE, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.UNVOTE, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.UNVOTE, mockEvent),
    true,
  );
});

Deno.test("UNVOTE - restricted vote => only certain roles can unvote", () => {
  mockEvent.event.everyone_can_vote = false;
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.UNVOTE, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.UNVOTE, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.INVITER, PERMISSIONS.UNVOTE, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.UNVOTE, mockEvent),
    true,
  );
});

Deno.test("UPDATE_USER_ROLE - only owner", () => {
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.UPDATE_USER_ROLE, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.UPDATE_USER_ROLE, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.UPDATE_USER_ROLE, mockEvent),
    false,
  );
});

Deno.test("REMOVE_USER - only owner", () => {
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.REMOVE_USER, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.INVITER, PERMISSIONS.REMOVE_USER, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.REMOVE_USER, mockEvent),
    false,
  );
});

Deno.test("EDIT_EVENT - only owner", () => {
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.EDIT_EVENT, mockEvent),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.EDIT_EVENT, mockEvent),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.EDIT_EVENT, mockEvent),
    false,
  );
});

Deno.test("Unknown permission returns false", () => {
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, "unknown_permission", mockEvent),
    false,
  );
});
