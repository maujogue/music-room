import { assertThrows, assertStrictEquals, assertRejects } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { checkPlaylistAccess } from "../../../functions/playlists/permissions.ts";

import { PlaylistResponse } from "@playlist";

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

Deno.test("throws 404 if playlist is null", () => {
  assertThrows(
    () => checkPlaylistAccess(null as any, "user123"),
    HTTPException,
    "Playlist not found"
  );
});

Deno.test("returns playlist if it is public", async () => {
  mockPlaylist.is_private = false;
  const result = await checkPlaylistAccess(mockPlaylist as any, "user123");
  assertStrictEquals(result, mockPlaylist);
});


Deno.test("throws 403 if access is denied", async () => {
  mockPlaylist.is_private = true;
  assertThrows(
    () => checkPlaylistAccess(mockPlaylist as any, "user123"),
    HTTPException,
    "Access denied to private playlist"
  );
});
