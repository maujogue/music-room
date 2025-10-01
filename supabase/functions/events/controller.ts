import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { getCurrentUser, getUserSpotifyToken } from '../auth.ts'
import getPublicUrlForPath from '../../utils/get_public_url_for_path.tsx'
import {
  createSupabaseEvent,
  getSupabaseEventById,
  getSupabaseEventByOwner,
  deleteSupabaseEventById,
  updateSupabaseEventById,
  uploadEventImage
} from './service.ts'
import {
  validateEventPayload
} from './validators.ts'


export async function createEvent(c: Context): Promise<any> {
  const contentTypeHeader = c.req.header('content-type') || ''
  let body: any = {}
  let uploadedFile: File | null = null

  if (contentTypeHeader.includes('multipart/form-data')) {
    const form = await c.req.raw.formData()
    for (const [key, value] of form.entries()) {
      if (key === 'image') {
        uploadedFile = value as File
      } else if (key === 'location') {
        try {
          body.location = JSON.parse(value as string)
        } catch (e) {
          body.location = value === '' ? null : value
        }
      } else {
        body[key] = value === '' ? null : value
      }
    }
  } else {
    body = await c.req.json()
  }

  body.owner_id = c.get('user').id

  const validation = validateEventPayload(body, { requireName: true })
  if (!validation.valid) {
    throw new HTTPException(400, { message: validation.message })
  }

  if (uploadedFile) {
    try {
      const publicUrl = await uploadEventImage(uploadedFile as File)
      body.image_url = publicUrl
    } catch (err) {
      console.error('Error uploading file in createEvent:', err)
      throw new HTTPException(500, { message: 'Failed to upload image' })
    }
  }

  const event = await createSupabaseEvent(body)
  if (!event) {
    throw new HTTPException(500, { message: 'Failed to create event' })
  }

  c.status(201)
  return c.json(event)
}

export async function fetchEvent(c: Context): Promise<any> {
  const id = c.req.param('id')
  const event = await getSupabaseEventById(id)
  if (!event) {
    throw new HTTPException(404, { message: 'Event not found' })
  }

  try {
    const imagePath = event.event?.image_url;
    if (imagePath) {
      const publicUrl = await getPublicUrlForPath(imagePath);
      console.log('Resolved public URL for image:', publicUrl);
      event.event.image_url = publicUrl;
    }
  } catch (err) {
    console.error('Error resolving public url for image:', err);
  }

  // console.log('Fetched event:', event)
  c.status(200)
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

  const contentTypeHeader = c.req.header('content-type') || ''
  let body: any = {}
  let uploadedFile: File | null = null

  if (contentTypeHeader.includes('multipart/form-data')) {
    const form = await c.req.raw.formData()
    for (const [key, value] of form.entries()) {
      if (key === 'image') {
        uploadedFile = value as File
      } else if (key === 'location') {
        try {
          body.location = JSON.parse(value as string)
        } catch (e) {
          body.location = value === '' ? null : value
        }
      } else {
        body[key] = value === '' ? null : value
      }
    }
  } else {
    body = await c.req.json()
  }

  const validation = validateEventPayload(body, { requireName: false })
  if (!validation.valid) {
    c.status(400)
    return c.json({ error: validation.message })
  }

  const user = c.get('user')
  const { location, ...eventData } = body;

  const data = await getSupabaseEventById(id)
  if (!data) {
    c.status(404)
    return c.json({ error: 'Event not found' })
  }

  if (data.event.owner_id !== user.id) {
    c.status(403)
    return c.json({ error: 'You do not have permission to update this event' })
  }

  if (uploadedFile) {
    try {
      const publicUrl = await uploadEventImage(uploadedFile as File);
      eventData.image_url = publicUrl;
    } catch (err) {
      console.error('Error uploading file:', err);
      c.status(500);
      return c.json({ error: 'Failed to process uploaded image' });
    }
  }

  const updated = await updateSupabaseEventById(id, eventData, location)
  if (!updated) {
    c.status(500)
    return c.json({ error: 'Failed to update event' })
  }

  return c.json(updated)
}
