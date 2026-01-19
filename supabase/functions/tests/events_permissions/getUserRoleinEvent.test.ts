import { assertStrictEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";

import {
  ROLES,
  getUserRoleInEvent,
} from "../../../functions/events/permissions.ts";
import type { PlaylistRow } from '@playlist';

import { EventResponse,
  EventLocation,
  Coordinates,
  SpotifyOwner,
  EventMember,
  EventRole }
from "@event";

const mockEventRole: EventRole = 'member'

const mockCoord: Coordinates = {
  lat: 5,
  long: 5
}

const mockLocation: EventLocation = {
  coordinates: mockCoord,
  venueName: 'venue',
  address: '30 rue du colonel Moutarde',
  city: 'Paris',
  country: 'France',
}

const mockOwner: SpotifyOwner = {
  id: 'owner123',
  name: 'mike_owner',
  email: 'miko@gmail.com',
  avatar_url: '',
}

const mockEventMember: EventMember = {
  id: 'member123',
  event_id: 'event123',
  user_id: 'member123',
  joined_at: '',
  profile: {
    id: 'profile1',
    name: 'dom',
    email: 'dom@gmail.com',
    avatar_url: '',
    music_genre: '',
  },
  role: mockEventRole
}

const mockPlaylistRow: PlaylistRow  = {
  id: 'playlist_row1',
  name: 'pl',
  description: '',
  is_private: true,
  is_collaborative: true,
  cover_url: null,
  created_at: '',
  updated_at: '',
  owner_id: 'owner123',
  is_spotify_sync: true,
  spotify_id: '',
}

const mockEvent: EventResponse = {
  event: {
    id: 'event123',
    name: 'the_event',
    image_url: '',
    is_private: false,
    everyone_can_vote: false,
    description: '',
    playlist_id: '',
    playlistId: '',
    beginning_at: '',
    spatio_licence: false,
    done: false
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
  }
}


Deno.test("returns OWNER if userId is the event's owner", () => {
  const ownerId = "owner123";
  const role = getUserRoleInEvent(mockEvent, ownerId);
  assertStrictEquals(role, ROLES.OWNER);
});

Deno.test("returns MEMBER if userId is a member with role 'member'", () => {
  const userId = "member123";
  const role = getUserRoleInEvent(mockEvent, userId);
  assertStrictEquals(role, ROLES.MEMBER);
});

Deno.test("returns VOTER if userId is a member with role 'voter'", () => {
  const userId = "member123";
  mockEventMember.role = 'voter'
  const role = getUserRoleInEvent(mockEvent, userId);
  assertStrictEquals(role, ROLES.VOTER);
});

Deno.test("returns INVITER if userId is a member with role 'inviter'", () => {
  const userId = "member123";
  mockEventMember.role = 'inviter'
  const role = getUserRoleInEvent(mockEvent, userId);
  assertStrictEquals(role, ROLES.INVITER);
});

Deno.test("returns COLLABORATOR if userId is a member with role 'collaborator'", () => {
  const userId = "member123";
  mockEventMember.role = 'collaborator'
  const role = getUserRoleInEvent(mockEvent, userId);
  assertStrictEquals(role, ROLES.COLLABORATOR);
});

Deno.test("returns null if userId is a member with unknown role", () => {
  const userId = "member123";
  mockEventMember.role = null;
  const role = getUserRoleInEvent(mockEvent, userId);
  assertStrictEquals(role, null);
});

Deno.test("returns null if userId is not found in event", () => {
  const userId = "notfound123";
  const role = getUserRoleInEvent(mockEvent, userId);
  assertStrictEquals(role, null);
});
