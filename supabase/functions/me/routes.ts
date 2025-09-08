import { Hono } from 'jsr:@hono/hono'
import {
    fetchCurrentUserPlaylists,
    fetchCurrentUserPlayingTrack,
    startUserPlayback,
    pauseUserPlayback,
    skipToNextUserTrack
} from './controller.ts'

const router = new Hono()

router.get('/playlists', fetchCurrentUserPlaylists)
router.get('/player/currently-playing', fetchCurrentUserPlayingTrack)
router.put('/player/play', startUserPlayback)
router.put('/player/pause', pauseUserPlayback)
router.post('/player/next', skipToNextUserTrack)

export default router
