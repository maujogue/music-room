import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'
import { createSupabaseEvent } from './service.ts'

export async function createEvent(c: Context): Promise<any> {
  const body = await c.req.json()
  body.owner_id = c.get('user').id

  if (!body.name || body.name.length < 3) {
    throw new HTTPException(400, { message: 'Event name must be at least 3 characters long' })
  }

  const event = await createSupabaseEvent(body)
  if (!event) {
    throw new HTTPException(500, { message: 'Failed to create event' })
  }

  console.log('Event created:', event);

  c.status(201)
  return c.json(event)
}

