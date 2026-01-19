import {
  assertStrictEquals,
  assertThrows,
} from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { HTTPException } from "https://deno.land/x/hono@v3.2.3/http-exception.ts";
import { checkPlaylistAccess } from "../../../functions/playlists/permissions.ts";

const valid_playlist = {
  id: "playlistId",
  name: "Jazz",
  description: "Jazz music",
  cover_url: "",
  owner_id: "ownerId",
  is_private: true,
  is_collaborative: false,
  created_at: "01-01-2025",
  updated_at: "01-10-2025",
  is_spotify_sync: false,
  spotify_id: "spt258",
  owner: { id: "ownerId" },
  collaborators: [{ id: "collab" }],
  members: [{ id: "member" }],
} as any;

Deno.test("throws 404 if playlist is null", () => {
  assertThrows(
    () => checkPlaylistAccess(null as any, "user123"),
    HTTPException,
    "Playlist not found",
  );
});

Deno.test("returns playlist if it is public", () => {
  const playlist = { is_private: false } as any;
  const result = checkPlaylistAccess(playlist, "user123");
  assertStrictEquals(result, playlist);
});

Deno.test("throws 403 if access is denied", () => {
  assertThrows(
    () => checkPlaylistAccess(valid_playlist, "user123"),
    HTTPException,
    "Access denied to private playlist",
  );
});
