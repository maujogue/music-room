import { Hono } from 'jsr:@hono/hono'
import {
    fetchCurrentUserPlaylists,
    fetchCurrentUserPlayingTrack
} from './controller.ts'

const router = new Hono()

router.get('/playlists', fetchCurrentUserPlaylists)
router.get('/player/currently-playing', fetchCurrentUserPlayingTrack)

export default router
