import { Hono } from 'jsr:@hono/hono'
import { fetchCurrentUserPlaylists } from './controller.ts'

const router = new Hono()

router.get('/', fetchCurrentUserPlaylists)

export default router
