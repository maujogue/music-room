import { assertStrictEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { PlaylistResponse } from "@playlist";

import {
  ROLES,
  PERMISSIONS,
  canUserPerformAction,
} from "../../../functions/playlists/permissions.ts";


const mockPlaylist: PlaylistResponse = {
  id: 'playlist_1',
  name: 'Test Playlist',
  owner_id: 'user_1',
  is_private: true,
  is_collaborative: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tracks: [],
  collaborators: [],
  members: [],
  owner: {
    id: 'user_1',
    name: 'Owner User',
    email: 'owner@example.com',
  },
  user: {
    can_edit: true,
    can_invite: true,
    is_following: true,
    role: 'owner'
  }
};


Deno.test("READ_PLAYLIST - public playlist - anyone can read", () => {
  mockPlaylist.is_private = false
  const result_owner = canUserPerformAction(ROLES.OWNER, PERMISSIONS.READ_PLAYLIST, mockPlaylist);
  const result_collaborator = canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.READ_PLAYLIST, mockPlaylist);
  const result_member = canUserPerformAction(ROLES.MEMBER, PERMISSIONS.READ_PLAYLIST, mockPlaylist);

  assertStrictEquals(result_owner, true);
  assertStrictEquals(result_collaborator, true);
  assertStrictEquals(result_member, true);
});

Deno.test("READ_PLAYLIST - private playlist - only members can read", () => {
  mockPlaylist.is_private = true
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.READ_PLAYLIST, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.READ_PLAYLIST, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.READ_PLAYLIST, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.READ_PLAYLIST, mockPlaylist), false);
});

Deno.test("ADD_SONG - collaborative playlist - anyone can add", () => {
  mockPlaylist.is_collaborative = true;
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_SONG, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.ADD_SONG, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_SONG, mockPlaylist), true);
});

Deno.test("ADD_SONG - non-collaborative playlist - only owner or collaborator", () => {
  mockPlaylist.is_collaborative = false;
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_SONG, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.ADD_SONG, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_SONG, mockPlaylist), false);
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.ADD_SONG, mockPlaylist), false);
});

Deno.test("DELETE_SONG - collaborative playlist - only owner or collaborator", () => {
  mockPlaylist.is_collaborative = true;
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_SONG, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.DELETE_SONG, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_SONG, mockPlaylist), false);
});

Deno.test("DELETE_SONG - non-collaborative playlist - only owner", () => {
  mockPlaylist.is_collaborative = false;
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_SONG, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.DELETE_SONG, mockPlaylist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_SONG, mockPlaylist), false);
});

Deno.test("ADD_USER - public playlist - anyone can invite", () => {
  mockPlaylist.user.can_invite = true;
  mockPlaylist.is_private = false;
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.ADD_USER, mockPlaylist), true);
});

Deno.test("ADD_USER - private playlist - only owner or collaborator", () => {
  mockPlaylist.user.can_invite = true;
  mockPlaylist.is_private = true;
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_USER, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.ADD_USER, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_USER, mockPlaylist), false);
});

Deno.test("DELETE_PLAYLIST - only owner can delete", () => {
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_PLAYLIST, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.DELETE_PLAYLIST, mockPlaylist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, mockPlaylist), false);
});

Deno.test("UPDATE_USER_ROLE - only owner", () => {
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.UPDATE_USER_ROLE, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.UPDATE_USER_ROLE, mockPlaylist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, mockPlaylist), false);
});

Deno.test("REMOVE_USER - only owner", () => {
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.REMOVE_USER, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.REMOVE_USER, mockPlaylist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, mockPlaylist), false);
});

Deno.test("EDIT_PLAYLIST - only owner", () => {
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.EDIT_PLAYLIST, mockPlaylist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.REMOVE_USER, mockPlaylist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, mockPlaylist), false);
});

Deno.test("Unknown permission returns false", () => {
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, "unknown_permission", mockPlaylist), false);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, "unknown_permission", mockPlaylist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, "unknown_permission", mockPlaylist), false);
});
