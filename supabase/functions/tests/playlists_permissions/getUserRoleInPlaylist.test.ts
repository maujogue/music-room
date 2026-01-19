import { assertStrictEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";

import {
  ROLES,
  getUserRoleInPlaylist,
} from "../../../functions/playlists/permissions.ts";

import { PlaylistResponse, PlaylistMember, PlaylistCollaborator } from "@playlist";

const mockMember: PlaylistMember = {
  id: 'member123',
  playlist_id: 'playlist_1',
  user_id: 'user_3',
  added_at: '',
  added_by: ''
}

const mockCollaborator: PlaylistCollaborator = {
  id: 'collab123',
  playlist_id: 'playlist_1',
  user_id: 'user_2',
  added_at: '',
  added_by: '',
  role: 'collaborator'
}

const mockPlaylist: PlaylistResponse = {
  id: 'playlist_1',
  name: 'Test Playlist',
  owner_id: 'owner123',
  is_private: true,
  is_collaborative: false,
  can_invite: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tracks: [],
  collaborators: [mockCollaborator],
  members: [mockMember],
  owner: {
    id: 'owner123',
    name: 'Owner User',
    email: 'owner@example.com',
  },
};

const emptyMockPlaylist: PlaylistResponse = {
  id: 'playlist_1',
  name: 'Test Playlist',
  owner_id: 'owner123',
  is_private: true,
  is_collaborative: false,
  can_invite: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tracks: [],
  collaborators: [],
  members: [],
  owner: {
    id: 'owner123',
    name: 'Owner User',
    email: 'owner@example.com',
  },
};


Deno.test("returns OWNER if userId is the owner's", () => {
  const ownerId = "owner123";
  const playlist = {
    owner: { id: ownerId },
    collaborators: [{ id: "collab123" }],
    members: [{ id: "member123" }],
  } as any;
  const role = getUserRoleInPlaylist(playlist, ownerId);
  assertStrictEquals(role, ROLES.OWNER);
});

Deno.test("returns COLLABORATOR if userId is in collaborators", () => {
  const collaboratorId = "collab123";
  const playlist = {
    owner: { id: "owner123" },
    collaborators: [{ id: collaboratorId }, {id: "another_one"}],
    members: [{ id: "member123" }],
  } as any;
  const role = getUserRoleInPlaylist(playlist, collaboratorId);
  assertStrictEquals(role, ROLES.COLLABORATOR);
});

Deno.test("returns MEMBER if userId is in members", () => {
  const memberId = "member123";
  const playlist = {
    owner: { id: "owner123" },
    collaborators: [{ id: "collab123" }],
    members: [{ id: memberId }],
  } as any;
  const role = getUserRoleInPlaylist(playlist, memberId);
  assertStrictEquals(role, ROLES.MEMBER);
});

Deno.test("returns NONE if userId is not in any role", () => {
  const unknownId = "unknown123";
  const playlist = {
    owner: { id: "owner123" },
    collaborators: [{ id: "collab123" }],
    members: [{ id: "member123" }],
  } as any;
  const role = getUserRoleInPlaylist(playlist, unknownId);
  assertStrictEquals(role, ROLES.NONE);
});

Deno.test("returns NONE if playlist has no collaborators or members", () => {
  const collaboratorId = "collab123";
  const playlist = {
    owner: { id: "owner123" },
  } as any;
  const role = getUserRoleInPlaylist(playlist, collaboratorId);
  assertStrictEquals(role, ROLES.NONE);
});

Deno.test("returns NONE if userId  is not a member in the playlist", () => {
  const unknownId = "notInPlaylist";
  const playlist = {
    owner: { id: "owner123" },
    collaborators: [{ id: "collab123" }],
    members: [{ id: "member123" }],
  } as any;

  const role = getUserRoleInPlaylist(playlist, unknownId);
  assertStrictEquals(role, ROLES.NONE);
});
