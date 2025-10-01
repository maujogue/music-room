import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserSpotifyToken } from '../auth.ts'
import {
	createEvent,
	fetchEvent,
	deleteEventById,
	updateEventById,
	addUserToEvent
} from './controller.ts'

const router = new Hono()

router.post('/', createEvent)

router.get('/:id', fetchEvent)

router.delete('/:id', deleteEventById)

router.put('/:id', updateEventById)

router.post('/:id/invite', addUserToEvent)

export default router
