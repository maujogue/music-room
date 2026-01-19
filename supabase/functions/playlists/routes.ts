import { Hono } from "@hono/hono";
import {
  addItemsToPlaylist,
  addUserToPlaylist,
  createPlaylist,
  deleteItemsFromPlaylist,
  deletePlaylist,
  fetchPlaylistItems,
  removeUserFromPlaylist,
  updatePlaylist,
} from "./controller.ts";

const playlistRoutes = new Hono();

playlistRoutes.post("/", createPlaylist);

playlistRoutes.get("/:id", fetchPlaylistItems);

playlistRoutes.delete("/:id", deletePlaylist);

playlistRoutes.put("/:id", updatePlaylist);

playlistRoutes.post("/:id/tracks", addItemsToPlaylist);

playlistRoutes.delete("/:id/tracks", deleteItemsFromPlaylist);

playlistRoutes.post("/:id/users", addUserToPlaylist);

playlistRoutes.delete("/:id/users", removeUserFromPlaylist);

export default playlistRoutes;
