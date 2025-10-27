import { assertStrictEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";

import {
  ROLES,
  getUserRoleInPlaylist,
} from "../../../functions/playlists/permissions.ts";


Deno.test("returns OWNER if userId is the owner's", () => {
  const ownerId = "owner123";
  const playlist = {
    owner: { id: ownerId },
    collaborators: [{ id: "collab123" }],
    members: [{ id: "member123" }],
  };
  const role = getUserRoleInPlaylist(playlist, ownerId);
  assertStrictEquals(role, ROLES.OWNER);
});

Deno.test("returns COLLABORATOR if userId is in collaborators", () => {
  const collaboratorId = "collab123";
  const playlist = {
    owner: { id: "owner123" },
    collaborators: [{ id: collaboratorId }, {id: "another_one"}],
    members: [{ id: "member123" }],
  };
  const role = getUserRoleInPlaylist(playlist, collaboratorId);
  assertStrictEquals(role, ROLES.COLLABORATOR);
});

Deno.test("returns MEMBER if userId is in members", () => {
  const memberId = "member123";
  const playlist = {
    owner: { id: "owner123" },
    collaborators: [{ id: "collab123" }],
    members: [{ id: memberId }],
  };
  const role = getUserRoleInPlaylist(playlist, memberId);
  assertStrictEquals(role, ROLES.MEMBER);
});

Deno.test("returns null if userId is not in any role", () => {
  const unknownId = "unknown123";
  const playlist = {
    owner: { id: "owner123" },
    collaborators: [{ id: "collab123" }],
    members: [{ id: "member123" }],
  };
  const role = getUserRoleInPlaylist(playlist, unknownId);
  assertStrictEquals(role, null);
});

Deno.test("returns null if playlist has no collaborators or members", () => {
  const collaboratorId = "collab123";
  const playlist = {
    owner: { id: "owner123" },
  };
  const role = getUserRoleInPlaylist(playlist, collaboratorId);
  assertStrictEquals(role, null);
});

Deno.test("returns null if userId  is not a member in the playlist", () => {
  const unknownId = "notInPlaylist";
  const playlist = {
    owner: { id: "owner123" },
    collaborators: [{ id: "collab123" }],
    members: [{ id: "member123" }],
  };

  const role = getUserRoleInPlaylist(playlist, unknownId);
  assertStrictEquals(role, null);
});
