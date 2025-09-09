import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'
import {
  createSupabaseEvent,
  getSupabaseEventById,
  getSupabaseEventByOwner
} from './service.ts'

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

export async function fetchEvent(c: Context): Promise<any> {
  const id = c.req.param('id')
  const event = await getSupabaseEventById(id)
  if (!event) {
    throw new HTTPException(404, { message: 'Event not found' })
  }

  return c.json(event)
}

export async function fetchAllUserEvents(c: Context): Promise<any> {
  const user = c.get('user')

  const events = await getSupabaseEventByOwner(user.id)
  if (!events) {
    throw new HTTPException(500, { message: 'Failed to fetch events' })
  }

  return c.json(events)
}


