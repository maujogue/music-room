import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'
import { createEvent, fetchEvent } from './controller.ts'

const router = new Hono()

router.post('/', async (c) => {
	return createEvent(c)
})

router.get('/:id', async (c) => {
	return fetchEvent(c)
})

export default router
