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
  uploadEventImage,
  addUserToEventSupabase,
  removeUserFromEventSupabase,
  editUserInEventSupabase
} from './service.ts'
import {
  validateEventPayload,
  validateAddUserPayload,
  validateRemoveUserPayload,
  validateEditUserPayload
} from './validators.ts'
import {
  checkEventAccess,
  checkPermission,
  PERMISSIONS,
} from './permissions.ts'

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
      } else if (key === 'is_private' || key === 'everyone_can_vote') {
        const s = String(value);
        if (s === '') {
          body[key] = null;
        } else if (s === 'true' || s === '1') {
          body[key] = true;
        } else if (s === 'false' || s === '0') {
          body[key] = false;
        } else {
          try {
            body[key] = JSON.parse(s);
          } catch (e) {
            body[key] = s;
          }
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
  const user = c.get('user')
  let data = await getSupabaseEventById(id)
  if (!data) {
    throw new HTTPException(404, { message: 'Event not found' })
  }
  await checkEventAccess(data, user.id)

  try {
    const imagePath = data.event?.image_url;
    if (imagePath) {
      const publicUrl = await getPublicUrlForPath(imagePath);
      data.event.image_url = publicUrl;
    }
  } catch (err) {
    console.error('Error resolving public url for image:', err);
  }

  data = setUserPermissions(data, user)

  c.status(200)
  return c.json(data)
}

function setUserPermissions(data: any, user: any) {
  const memberEvent = data.members.find((m: any) => m.profile.id === user.id)

  if (data.event.owner_id === user.id) {
    data.user = {
      role: 'owner',
      can_edit: true,
      can_delete: true,
      can_invite: true,
      can_vote: true
    }
    return data
  }

  if (!memberEvent && data.event.is_private) {
    throw new HTTPException(403, { message: 'You do not have permission to view this private event' })
  }

  if (!memberEvent) {
    data.user = {
      role: null,
      can_edit: false,
      can_delete: false,
      can_invite: data.event.is_private ? false : true,
      can_vote: data.event.everyone_can_vote
    }
    return data
  }

  data.user = {
    role: memberEvent.role,
    can_edit: false,
    can_delete: false,
    can_invite: data.event.is_private ? false : true,
    can_vote: data.event.everyone_can_vote
  }

  if (data.event.is_private) {
    data.user.can_invite = (memberEvent.role === 'inviter' || memberEvent.role === 'collaborator')
  }
  if (data.event.everyone_can_vote) {
    data.user.can_vote = (memberEvent.role === 'voter' || memberEvent.role === 'collaborator')
  }
  return data
}

export async function deleteEventById(c: Context): Promise<any> {
  const id = c.req.param('id')
  const user = c.get('user')

  await checkPermission(id, user.id, PERMISSIONS.DELETE_EVENT)

  const deleted = await deleteSupabaseEventById(id)
  if (!deleted) {
    throw new HTTPException(500, { message: 'Failed to delete event' })
  }

  c.status(200)
  return c.json({ message: 'Event deleted successfully' })
}

export async function updateEventById(c: Context): Promise<any> {
  const id = c.req.param('id')
  const user = c.get('user')

  await checkPermission(id, user.id, PERMISSIONS.EDIT_EVENT)

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
      } else if (key === 'is_private' || key === 'everyone_can_vote') {
        const s = String(value);
        if (s === '') {
          body[key] = null;
        } else if (s === 'true' || s === '1') {
          body[key] = true;
        } else if (s === 'false' || s === '0') {
          body[key] = false;
        } else {
          try {
            body[key] = JSON.parse(s);
          } catch (e) {
            body[key] = s;
          }
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

export async function addUserToEvent(c: Context): Promise<any> {
  const eventId = c.req.param('id')
  const body = await c.req.json()
  const user = c.get('user')

  if (body.user_id === '') {
    body.user_id = user.id
  }
  await checkPermission(eventId, user.id, PERMISSIONS.ADD_USER)
  console.log('Body in addUserToEvent:', body);
  const validation = validateAddUserPayload(body)
  if (!validation.valid) {
    throw new HTTPException(400, { message: validation.message })
  }

  const { user_id, role } = body
  const result = await addUserToEventSupabase(eventId, user_id, role)
  if (!result) {
    throw new HTTPException(500, { message: 'Failed to add user to event' })
  }
  return c.json({ message: 'User added to event successfully', data: result })
}

export async function removeUserFromEvent(c: Context): Promise<any> {
  const eventId = c.req.param('id')
  const body = await c.req.json()
  const user = c.get('user')

  if (body.user_id === '') {
    body.user_id = user.id
  }
  console.log('Body in removeUserFromEvent:', body);
  const validation = validateRemoveUserPayload(body)
  if (!validation.valid) {
    throw new HTTPException(400, { message: validation.message })
  }
  if (body.user_id !== user.id) {
    await checkPermission(eventId, user.id, PERMISSIONS.REMOVE_USER)
  }

  const { user_id } = body
  const result = await removeUserFromEventSupabase(eventId, user_id)
  if (!result) {
    throw new HTTPException(500, { message: 'Failed to remove user from event' })
  }
  return c.json({ message: 'User removed from event successfully', data: result })
}

export async function editUserInEvent(c: Context): Promise<any> {
  const eventId = c.req.param('id')
  const body = await c.req.json()
  const user = c.get('user')

  const validation = validateEditUserPayload(body)
  if (!validation.valid) {
    throw new HTTPException(400, { message: validation.message })
  }
  await checkPermission(eventId, user.id, PERMISSIONS.UPDATE_USER_ROLE)

  const { user_id, role } = body
  const result = await editUserInEventSupabase(eventId, user_id, role)

  if (!result) {
    throw new HTTPException(500, { message: 'Failed to edit user in event' })
  }
  return c.json({ message: 'User edited in event successfully', data: result })
}


