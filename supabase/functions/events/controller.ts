import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserToken } from '../auth.ts'
import {
  createSupabaseEvent,
  getSupabaseEventById,
  getSupabaseEventByOwner,
  deleteSupabaseEventById,
  updateSupabaseEventById
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

export async function deleteEventById(c: Context): Promise<any> {
  const id = c.req.param('id')
  const user = c.get('user')

  const events = await getSupabaseEventByOwner(user.id)
  const event = events.find((e: any) => e.id === id)
  if (!event) {
    throw new HTTPException(403, { message: 'You do not have permission to delete this event' })
  }

  const deleted = await deleteSupabaseEventById(id)
  if (!deleted) {
    throw new HTTPException(500, { message: 'Failed to delete event' })
  }

  c.status(200)
  return c.json({ message: 'Event deleted successfully' })
}

export async function updateEventById(c: Context): Promise<any> {
  const id = c.req.param('id')
  const body = await c.req.json()
  const user = c.get('user')
  const { locationData, ...eventData } = body;

  const data = await getSupabaseEventById(id)
  if (!data) {
    c.status(404)
    return c.json({ error: 'Event not found' })
  }
  console.log('Fetched event for update:', data.event.owner_id, user.id);
  if (data.event.owner_id !== user.id) {
    c.status(403)
    return c.json({ error: 'You do not have permission to update this event' })
  }
  const updated = await updateSupabaseEventById(id, eventData, locationData)
  if (!updated) {
    c.status(500)
    return c.json({ error: 'Failed to update event' })
  }

  return c.json(updated)
}
