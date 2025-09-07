import { Hono } from 'jsr:@hono/hono'
import {
    fetchCurrentUserPlaylists,
    fetchCurrentUserPlayingTrack
} from './controller.ts'

const router = new Hono()

router.get('/playlists', fetchCurrentUserPlaylists)
router.get('/player/currently-playing', fetchCurrentUserPlayingTrack)
router.put('/player/play', fetchCurrentUserPlayingTrack)
router.put('/player/pause', fetchCurrentUserPlayingTrack)
router.post('/player/next', fetchCurrentUserPlayingTrack)

export default router
