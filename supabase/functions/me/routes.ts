import { Hono } from "@hono/hono";
import {
  createMySubscription,
  deleteMySubscription,
  fetchCurrentUserEvents,
  fetchCurrentUserPlayingTrack,
  fetchCurrentUserPlaylists,
  fetchCurrentUserProfile,
  getMySubscription,
  pauseUserPlayback,
  skipToNextUserTrack,
  startUserPlayback,
  syncSpotifyPlaylists,
} from "./controller.ts";

const router = new Hono();

router.get("/profile", fetchCurrentUserProfile);
router.get("/playlists", fetchCurrentUserPlaylists);
router.get("/events", fetchCurrentUserEvents);
router.get("/player/currently-playing", fetchCurrentUserPlayingTrack);
router.put("/player/play", startUserPlayback);
router.put("/player/pause", pauseUserPlayback);
router.post("/player/next", skipToNextUserTrack);
router.post("/playlists/sync", syncSpotifyPlaylists);
router.get("/subscription", getMySubscription);
router.post("/subscription", createMySubscription);
router.delete("/subscription", deleteMySubscription);

export default router;
