import { assertRejects, assertStrictEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";

import {
  ROLES,
  PERMISSIONS,
  getUserRoleInPlaylist,
  canUserPerformAction,
  checkPermission
} from "../functions/playlists/permissions.ts";

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { checkPlaylistAccess } from "../functions/playlists/permissions.ts";

import 'jsr:@std/dotenv/load'

// ----------------- SETUP ---------------------------

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
}

if (!supabaseUrl) throw new Error('supabaseUrl is required.')
if (!supabaseKey) throw new Error('supabaseKey is required.')

const client: SupabaseClient = createClient(supabaseUrl, supabaseKey, options)

const valid_playlist = {
  id: "playlistId",
  title: "Jazz",
  description: "Jazz music",
  cover_url: "",
  owner_id: "ownerId",
  is_private: "true",
  is_collaborative: "false",
  created_at: "01-01-2025",
  updated_at: "01-10-2025",
  is_spotify_sync: "false",
  spotify_id: "spt258",
  can_edit: "false",
  owner: { id: "ownerId" },
  collaborators: [{id: "collab"}],
  members: [{id: "member"}]
}


// ----------------- getUserRoleInPlaylist ---------------------------


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


// ----------------- canUserPerformAction ---------------------------


Deno.test("READ_PLAYLIST - public playlist - anyone can read", () => {
  const playlist = { is_private: false };
  const result_owner = canUserPerformAction(ROLES.OWNER, PERMISSIONS.READ_PLAYLIST, playlist);
  const result_collaborator = canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.READ_PLAYLIST, playlist);
  const result_member = canUserPerformAction(ROLES.MEMBER, PERMISSIONS.READ_PLAYLIST, playlist);

  assertStrictEquals(result_owner, true);
  assertStrictEquals(result_collaborator, true);
  assertStrictEquals(result_member, true);
});

Deno.test("READ_PLAYLIST - private playlist - only members can read", () => {
  const playlist = { is_private: true };
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.READ_PLAYLIST, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.READ_PLAYLIST, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.READ_PLAYLIST, playlist), true);
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.READ_PLAYLIST, playlist), false);
});

Deno.test("ADD_SONG - collaborative playlist - anyone can add", () => {
  const playlist = { is_collaborative: true };
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_SONG, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.ADD_SONG, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_SONG, playlist), true);
});

Deno.test("ADD_SONG - non-collaborative playlist - only owner or collaborator", () => {
  const playlist = { is_collaborative: false };
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_SONG, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.ADD_SONG, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_SONG, playlist), false);
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.ADD_SONG, playlist), false);
});

Deno.test("DELETE_SONG - collaborative playlist - only owner or collaborator", () => {
  const playlist = { is_collaborative: true };
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_SONG, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.DELETE_SONG, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_SONG, playlist), false);
});

Deno.test("DELETE_SONG - non-collaborative playlist - only owner", () => {
  const playlist = { is_collaborative: false };
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_SONG, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.DELETE_SONG, playlist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_SONG, playlist), false);
});

Deno.test("ADD_USER - can_invite=false - always false", () => {
  const playlist = { can_invite: false, is_private: false };
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_USER, playlist), false);
});

Deno.test("ADD_USER - public playlist - anyone can invite", () => {
  const playlist = { can_invite: true, is_private: false };
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.ADD_USER, playlist), true);
});

Deno.test("ADD_USER - private playlist - only owner or collaborator", () => {
  const playlist = { can_invite: true, is_private: true };
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_USER, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.ADD_USER, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_USER, playlist), false);
});

Deno.test("DELETE_PLAYLIST - only owner can delete", () => {
  const playlist = {};
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_PLAYLIST, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.DELETE_PLAYLIST, playlist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, playlist), false);
});

Deno.test("UPDATE_USER_ROLE - only owner", () => {
  const playlist = {};
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.UPDATE_USER_ROLE, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.UPDATE_USER_ROLE, playlist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, playlist), false);
});

Deno.test("REMOVE_USER - only owner", () => {
  const playlist = {};
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.REMOVE_USER, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.REMOVE_USER, playlist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, playlist), false);
});

Deno.test("EDIT_PLAYLIST - only owner", () => {
  const playlist = {};
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.EDIT_PLAYLIST, playlist), true);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, PERMISSIONS.REMOVE_USER, playlist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_PLAYLIST, playlist), false);
});

Deno.test("Unknown permission returns false", () => {
  const playlist = {};
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, "unknown_permission", playlist), false);
  assertStrictEquals(canUserPerformAction(ROLES.COLLABORATOR, "unknown_permission", playlist), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, "unknown_permission", playlist), false);
});


// ----------------- checkPermission -----------------------


// ----------------- checkPlaylistAccess -------------------


Deno.test("throws 404 if playlist is null", async () => {
  await assertRejects(
    () => checkPlaylistAccess(null as any, "user123"),
    HTTPException,
    "Playlist not found"
  );
});

Deno.test("returns playlist if it is public", async () => {
  const playlist = { is_private: false };
  const result = await checkPlaylistAccess(playlist as any, "user123");
  assertStrictEquals(result, playlist);
});

Deno.test("throws 403 if access is denied", async () => {


  await assertRejects(
    () => checkPlaylistAccess(valid_playlist as any, "user123"),
    HTTPException,
    "Access denied to private playlist"
  );
});


