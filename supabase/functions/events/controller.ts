import { Context } from "@hono/hono";
import { HTTPException } from "@hono/http-exception";
import getPublicUrlForPath from "../../utils/get_public_url_for_path.tsx";
import {
  addUserToEventSupabase,
  createSupabaseEvent,
  deleteSupabaseEventById,
  editUserInEventSupabase,
  getSupabaseEventByCoordinates,
  getSupabaseEventById,
  removeUserFromEventSupabase,
  supabaseStartEvent,
  supabaseStopEvent,
  updateSupabaseEventById,
  uploadEventImage,
} from "./service.ts";
import {
  validateAddUserPayload,
  validateEditUserPayload,
  validateEventPayload,
  validateRemoveUserPayload,
} from "./validators.ts";
import {
  checkEventAccess,
  checkPermission,
  PERMISSIONS,
} from "./permissions.ts";
import type {
  EventMember,
  EventPayload,
  EventRadarFromDb,
  EventResponse,
} from "@event";
import type { User } from "@supabase/supabase-js";
import { safeJsonFromContext } from "@utils/parsing";

export async function createEvent(c: Context): Promise<Response> {
  const contentTypeHeader = c.req.header("content-type") || "";
  let payload: EventPayload;
  let uploadedFile: File | null = null;

  if (contentTypeHeader.includes("multipart/form-data")) {
    const form = await c.req.raw.formData();
    const result = createPayloadFromFormData(form);
    payload = result.payload;
    uploadedFile = result.uploadedFile;
  } else {
    payload = await safeJsonFromContext(c);
  }

  const validation = validateEventPayload(
    payload,
    {
      requireName: true,
      requireDateTime: true,
      requireLocation: true,
      requirePlaylist: true,
    },
  );

  if (!validation.valid) {
    return c.json({ error: validation.message }, 400);
  }

  if (uploadedFile) {
    try {
      const publicUrl = await uploadEventImage(uploadedFile as File);
      payload.image_url = publicUrl;
    } catch (err) {
      console.error("Error uploading file in createEvent:", err);
      throw new HTTPException(500, { message: "Failed to upload image" });
    }
  }

  await createSupabaseEvent(payload, c.get("user").id);

  c.status(201);
  return c.json({ message: "Event created successfully" });
}

function createPayloadFromFormData(
  form: FormData,
): { payload: EventPayload; uploadedFile: File | null } {
  const payload: EventPayload = {} as EventPayload;
  let uploadedFile: File | null = null;

  for (const [key, value] of form.entries()) {
    switch (key) {
      case "image":
        uploadedFile = value as File;
        break;
      case "location":
        try {
          payload.location = JSON.parse(value as string);
        } catch (_e) {
          payload.location = value === "" ? undefined : value as any;
        }
        break;
      case "is_private":
        payload.is_private = value === "true" || value === "1";
        break;
      case "everyone_can_vote":
        payload.everyone_can_vote = value === "true" || value === "1";
        break;
      case "done":
        payload.done = value === "true" || value === "1";
        break;
      case "spatio_licence":
        payload.spatio_licence = value === "true" || value === "1";
        break;
      case "name":
        payload.name = value as string;
        break;
      case "description":
        payload.description = value as string;
        break;
      case "playlist_id":
        payload.playlist_id = value as string;
        break;
      case "beginning_at":
        payload.beginning_at = value as string;
        break;
      default:
        break;
    }
  }

  return { payload, uploadedFile };
}

export async function fetchEvent(c: Context): Promise<Response> {
  const id = c.req.param("id");
  const user = c.get("user");
  let data = await getSupabaseEventById(id);
  if (!data) {
    throw new HTTPException(404, { message: "Event not found" });
  }
  checkEventAccess(data, user.id);

  try {
    const imagePath = data?.event.image_url;
    if (imagePath) {
      const publicUrl = await getPublicUrlForPath(imagePath);
      data.event.image_url = publicUrl;
    }
  } catch (err) {
    console.error("Error resolving public url for image:", err);
  }

  data = setUserPermissions(data, user);

  c.status(200);
  return c.json(data);
}

function setUserPermissions(data: EventResponse, user: User): EventResponse {
  const memberEvent = data.members.find((m: EventMember) =>
    m.profile.id === user.id
  );

  if (data.owner.id === user.id) {
    data.user = {
      role: "owner",
      can_edit: true,
      can_delete: true,
      can_invite: true,
      can_vote: true,
    };
    return data;
  }

  if (!memberEvent && data.event.is_private) {
    throw new HTTPException(403, {
      message: "You do not have permission to view this private event",
    });
  }

  if (!memberEvent) {
    data.user = {
      role: null,
      can_edit: false,
      can_delete: false,
      can_invite: data.event.is_private ? false : true,
      can_vote: data.event.everyone_can_vote,
    };
    return data;
  }

  data.user = {
    role: memberEvent.role,
    can_edit: false,
    can_delete: false,
    can_invite: data.event.is_private ? false : true,
    can_vote: data.event.everyone_can_vote,
  };

  if (data.event.is_private) {
    data.user.can_invite = memberEvent.role === "inviter" ||
      memberEvent.role === "collaborator";
  }
  if (data.event.everyone_can_vote) {
    data.user.can_vote = memberEvent.role === "voter" ||
      memberEvent.role === "collaborator";
  }
  return data;
}

export async function deleteEventById(c: Context): Promise<Response> {
  const id = c.req.param("id");
  const user = c.get("user");

  await checkPermission(id, user.id, PERMISSIONS.DELETE_EVENT);

  const deleted = await deleteSupabaseEventById(id);
  if (!deleted) {
    throw new HTTPException(500, { message: "Failed to delete event" });
  }

  c.status(200);
  return c.json({ message: "Event deleted successfully" });
}

export async function updateEventById(c: Context): Promise<Response> {
  const id = c.req.param("id");
  const user = c.get("user");

  await checkPermission(id, user.id, PERMISSIONS.EDIT_EVENT);

  const contentTypeHeader = c.req.header("content-type") || "";
  let body: any = {};
  let uploadedFile: File | null = null;

  if (contentTypeHeader.includes("multipart/form-data")) {
    const form = await c.req.raw.formData();
    const result = createPayloadFromFormData(form);
    body = result.payload;
    uploadedFile = result.uploadedFile;
  } else {
    body = await safeJsonFromContext(c);
  }

  const validation = validateEventPayload(body, { requireName: false });
  if (!validation.valid) {
    c.status(400);
    return c.json({ error: validation.message });
  }

  const { location, ...eventData } = body;

  const data = await getSupabaseEventById(id);
  if (!data) {
    c.status(404);
    return c.json({ error: "Event not found" });
  }

  if (data.owner.id !== user.id) {
    c.status(403);
    return c.json({ error: "You do not have permission to update this event" });
  }

  if (uploadedFile) {
    try {
      const publicUrl = await uploadEventImage(uploadedFile as File);
      eventData.image_url = publicUrl;
    } catch (err) {
      console.error("Error uploading file:", err);
      c.status(500);
      return c.json({ error: "Failed to process uploaded image" });
    }
  }

  await updateSupabaseEventById(id, eventData as EventPayload, location);

  return c.json({ message: "Event updated successfully" });
}

export async function startEvent(c: Context): Promise<Response> {
  const id = c.req.param("id");
  const user = c.get("user");

  await checkPermission(id, user.id, PERMISSIONS.EDIT_EVENT);

  const data = await getSupabaseEventById(id);
  if (!data) {
    c.status(404);
    return c.json({ error: "Event not found" });
  }

  if (data.owner.id !== user.id) {
    c.status(403);
    return c.json({ error: "Only owner can start an event" });
  }

  await supabaseStartEvent(id);

  return c.json({ message: "Event started successfully" });
}

export async function stopEvent(c: Context): Promise<Response> {
  const id = c.req.param("id");
  const user = c.get("user");

  await checkPermission(id, user.id, PERMISSIONS.EDIT_EVENT);

  const data = await getSupabaseEventById(id);
  if (!data) {
    c.status(404);
    return c.json({ error: "Event not found" });
  }

  if (data.owner.id !== user.id) {
    c.status(403);
    return c.json({ error: "Only owner can start an event" });
  }

  await supabaseStopEvent(id);

  return c.json({ message: "Event started successfully" });
}

export async function addUserToEvent(c: Context): Promise<Response> {
  const eventId = c.req.param("id");
  const body = await safeJsonFromContext(c);
  const user = c.get("user");

  if (body.user_id === "") {
    body.user_id = user.id;
  }
  await checkPermission(eventId, user.id, PERMISSIONS.ADD_USER);
  const validation = validateAddUserPayload(body);
  if (!validation.valid) {
    throw new HTTPException(400, { message: validation.message });
  }

  const { user_id, role } = body;
  await addUserToEventSupabase(eventId, user_id, role);
  return c.json({ message: "User added to event successfully" });
}

export async function removeUserFromEvent(c: Context): Promise<Response> {
  const eventId = c.req.param("id");
  const body = await safeJsonFromContext(c);
  const user = c.get("user");

  if (body.user_id === "") {
    body.user_id = user.id;
  }
  const validation = validateRemoveUserPayload(body);
  if (!validation.valid) {
    throw new HTTPException(400, { message: validation.message });
  }
  if (body.user_id !== user.id) {
    await checkPermission(eventId, user.id, PERMISSIONS.REMOVE_USER);
  }

  const { user_id } = body;
  await removeUserFromEventSupabase(eventId, user_id);
  return c.json({ message: "User removed from event successfully" });
}

export async function editUserInEvent(c: Context): Promise<Response> {
  const eventId = c.req.param("id");
  const body = await safeJsonFromContext(c);
  const user = c.get("user");

  const validation = validateEditUserPayload(body);
  if (!validation.valid) {
    throw new HTTPException(400, { message: validation.message });
  }
  await checkPermission(eventId, user.id, PERMISSIONS.UPDATE_USER_ROLE);

  const { user_id, role } = body;
  await editUserInEventSupabase(eventId, user_id, role);
  return c.json({ message: "User edited in event successfully" });
}

export async function getEventsByCoordinates(c: Context): Promise<Response> {
  const lat = c.req.query("lat");
  const long = c.req.query("long");

  if (!lat || !long) {
    throw new HTTPException(400, { message: "Missing latitude or longitude" });
  }

  const eventsRaw = await getSupabaseEventByCoordinates(
    Number(lat),
    Number(long),
  );
  const events = await Promise.all(
    eventsRaw.map((event: EventRadarFromDb) => formatEventsRadars(event)),
  );
  return c.json(events);
}

async function formatEventsRadars(event: EventRadarFromDb) {
  const {
    id,
    beginning_at,
    name,
    image_url,
    spatio_licence,
    done,
    owner_id,
    owner_username,
    owner_avatar_url,
    long,
    lat,
    dist_meters,
    venuename,
    description,
    everyone_can_vote,
  } = event;

  const publicUrl = image_url ? await getPublicUrlForPath(image_url) : null;

  return {
    event: {
      id,
      name,
      beginning_at,
      image_url: publicUrl,
      description,
      spatio_licence,
      done,
      everyone_can_vote,
    },
    owner: {
      id: owner_id,
      username: owner_username,
      avatar_url: owner_avatar_url,
    },
    radar: { coordinates: { lat, long }, dist: dist_meters, venuename },
  };
}
