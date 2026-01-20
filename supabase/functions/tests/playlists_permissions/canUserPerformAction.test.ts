import { assertStrictEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";

import {
  canUserPerformAction,
  PERMISSIONS,
  ROLES,
} from "../../../functions/playlists/permissions.ts";

Deno.test("READ_PLAYLIST - public playlist - anyone can read", () => {
  const playlist = { is_private: false } as any;
  const result_owner = canUserPerformAction(
    ROLES.OWNER,
    PERMISSIONS.READ_PLAYLIST,
    playlist,
  );
  const result_collaborator = canUserPerformAction(
    ROLES.COLLABORATOR,
    PERMISSIONS.READ_PLAYLIST,
    playlist,
  );
  const result_member = canUserPerformAction(
    ROLES.MEMBER,
    PERMISSIONS.READ_PLAYLIST,
    playlist,
  );

  assertStrictEquals(result_owner, true);
  assertStrictEquals(result_collaborator, true);
  assertStrictEquals(result_member, true);
});

Deno.test("READ_PLAYLIST - private playlist - only members can read", () => {
  const playlist = { is_private: true } as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.READ_PLAYLIST, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(
      ROLES.COLLABORATOR,
      PERMISSIONS.READ_PLAYLIST,
      playlist,
    ),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.READ_PLAYLIST, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.READ_PLAYLIST, playlist),
    false,
  );
});

Deno.test("ADD_SONG - collaborative playlist - anyone can add", () => {
  const playlist = { is_collaborative: true } as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_SONG, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.ADD_SONG, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_SONG, playlist),
    true,
  );
});

Deno.test("ADD_SONG - non-collaborative playlist - only owner or collaborator", () => {
  const playlist = { is_collaborative: false } as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_SONG, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.ADD_SONG, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_SONG, playlist),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.ADD_SONG, playlist),
    false,
  );
});

Deno.test("DELETE_SONG - collaborative playlist - only owner or collaborator", () => {
  const playlist = { is_collaborative: true } as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_SONG, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.DELETE_SONG, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_SONG, playlist),
    false,
  );
});

Deno.test("DELETE_SONG - non-collaborative playlist - only owner", () => {
  const playlist = { is_collaborative: false } as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_SONG, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.DELETE_SONG, playlist),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_SONG, playlist),
    false,
  );
});

Deno.test("ADD_USER - can_invite=false - always false", () => {
  const playlist = { can_invite: false, is_private: false } as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_USER, playlist),
    false,
  );
});

Deno.test("ADD_USER - public playlist - anyone can invite", () => {
  const playlist = { can_invite: true, is_private: false } as any;
  assertStrictEquals(
    canUserPerformAction(null, PERMISSIONS.ADD_USER, playlist),
    true,
  );
});

Deno.test("ADD_USER - private playlist - only owner or collaborator", () => {
  const playlist = { can_invite: true, is_private: true } as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_USER, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.ADD_USER, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_USER, playlist),
    false,
  );
});

Deno.test("DELETE_PLAYLIST - only owner can delete", () => {
  const playlist = {} as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_PLAYLIST, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(
      ROLES.COLLABORATOR,
      PERMISSIONS.DELETE_PLAYLIST,
      playlist,
    ),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, playlist),
    false,
  );
});

Deno.test("UPDATE_USER_ROLE - only owner", () => {
  const playlist = {} as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.UPDATE_USER_ROLE, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(
      ROLES.COLLABORATOR,
      PERMISSIONS.UPDATE_USER_ROLE,
      playlist,
    ),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, playlist),
    false,
  );
});

Deno.test("REMOVE_USER - only owner", () => {
  const playlist = {} as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.REMOVE_USER, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.REMOVE_USER, playlist),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, playlist),
    false,
  );
});

Deno.test("EDIT_PLAYLIST - only owner", () => {
  const playlist = {} as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, PERMISSIONS.EDIT_PLAYLIST, playlist),
    true,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.REMOVE_USER, playlist),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, playlist),
    false,
  );
});

Deno.test("Unknown permission returns false", () => {
  const playlist = {} as any;
  assertStrictEquals(
    canUserPerformAction(ROLES.OWNER, "unknown_permission", playlist),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.COLLABORATOR, "unknown_permission", playlist),
    false,
  );
  assertStrictEquals(
    canUserPerformAction(ROLES.MEMBER, "unknown_permission", playlist),
    false,
  );
});
