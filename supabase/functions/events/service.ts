import { HTTPException } from "@hono/http-exception";
import { createClient } from "@supabase/supabase-js";
import { formatDbError } from "@postgres/postgres_errors_map";
import { EventLocation, EventPayload, EventResponse } from "@event";
import { geometryToCoordinates } from "@utils/geometry";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function createSupabaseEvent(
  eventData: EventPayload,
  userId: string,
): Promise<void> {
  const { location, ...eventDetails } = eventData;

  const { data, error } = await supabaseClient.from("events")
    .insert(
      [{ ...eventDetails, owner_id: userId }],
    )
    .select()
    .single();

  if (error) {
    const pgError = formatDbError(error);
    console.error("Mapped PG error:", pgError);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  if (location && data) {
    const { coordinates, ...restLocation } = location;

    const locationData: any = {
      ...restLocation,
      event_id: data.id,
    };

    if (coordinates) {
      const { lat, long } = coordinates;
      if (typeof lat === "number" && typeof long === "number") {
        // POINT(x y)
        locationData.coordinates = `POINT(${long} ${lat})`;
      } else {
        throw new HTTPException(400, { message: "Invalid coordinates format" });
      }
    }

    const { error: locationError } = await supabaseClient
      .from("location")
      .insert([locationData]);

    if (locationError) {
      const pgError = formatDbError(locationError);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }
  }
}

export async function getSupabaseEventById(
  eventId: string,
): Promise<EventResponse | null> {
  const { data, error } = await supabaseClient.rpc("get_complete_event", {
    p_event_id: eventId,
  });

  if (error) {
    console.error("Raw Supabase error:", error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return data;
}

export async function getSupabaseEventByOwner(
  ownerId: string,
): Promise<EventResponse[]> {
  const { data, error } = await supabaseClient
    .from("events_with_location")
    .select("event, owner, location, members, playlist, user")
    .eq("owner_id", ownerId);

  if (error) {
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, {
      message: `Error fetching events: ${pgError.message}`,
    });
  }

  return (data || []).map((row: any) => {
    let location: EventLocation | undefined = row.location;

    if (location && typeof location.coordinates === "string") {
      const coords = geometryToCoordinates(location.coordinates);
      location = {
        ...location,
        coordinates: coords || undefined,
      };
    }

    const res: EventResponse = {
      ...row,
      location,
    };

    return res;
  });
}

export async function deleteSupabaseEventById(
  eventId: string,
): Promise<boolean> {
  const { error } = await supabaseClient.from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return true;
}

export async function updateSupabaseEventById(
  eventId: string,
  eventData?: EventPayload,
  locationData?: EventLocation,
): Promise<void> {
  if (eventData && Object.keys(eventData).length > 0) {
    const { error } = await supabaseClient
      .from("events")
      .update(eventData)
      .eq("id", eventId)
      .select();

    if (error) {
      console.error("Raw Supabase error:", error);
      const pgError = formatDbError(error);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }
  }

  if (locationData && Object.keys(locationData).length > 0) {
    const { coordinates, ...restLocation } = locationData;

    const updatePayload: any = {
      ...restLocation,
    };

    if (coordinates) {
      const { lat, long } = coordinates;
      if (typeof lat === "number" && typeof long === "number") {
        updatePayload.coordinates = `POINT(${long} ${lat})`;
      } else {
        throw new HTTPException(400, { message: "Invalid coordinates format" });
      }
    }

    const { error } = await supabaseClient
      .from("location")
      .update(updatePayload)
      .eq("event_id", eventId);

    if (error) {
      const pgError = formatDbError(error);
      console.error("Supabase location update error:", pgError.message);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }
  }
}

export async function supabaseStartEvent(eventId: string): Promise<void> {
  const { error } = await supabaseClient
    .from("events")
    .update({
      done: false,
      beginning_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) {
    console.error("Raw Supabase error:", error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
}

export async function supabaseStopEvent(eventId: string): Promise<void> {
  const { error } = await supabaseClient
    .from("events")
    .update({
      done: true,
    })
    .eq("id", eventId);

  if (error) {
    console.error("Raw Supabase error:", error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
}

export async function uploadEventImage(uploadedFile: File): Promise<string> {
  const arrayBuffer = await uploadedFile.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const ext = (uploadedFile.name || "jpg").split(".").pop() || "jpg";
  const path = `events/${Date.now()}.${ext}`;

  const { data, error: uploadError } = await supabaseClient.storage
    .from("avatars")
    .upload(path, buffer, {
      contentType: uploadedFile.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("Supabase upload error:", uploadError);
    throw uploadError;
  }

  return data?.path || path;
}

export async function getPublicUrlForPath(path: string): Promise<string> {
  const localUrl = Deno.env.get("SUPABASE_URL") ?? "";

  const { data, error } = await supabaseClient.storage
    .from("avatars")
    .createSignedUrl(path, 3600);

  if (error) {
    console.error("createSignedUrl error", error);
    throw error;
  }

  if (!data?.signedUrl) {
    throw new Error("No signed URL returned");
  }

  const publicUrl = data.signedUrl.replace(
    "http://kong:8000/storage/v1",
    `${localUrl}/storage/v1`,
  );

  console.log("Public URL:", publicUrl);
  return publicUrl;
}

export async function addUserToEventSupabase(
  eventId: string,
  userId: string,
  role: string,
): Promise<void> {
  const { error } = await supabaseClient.from("event_members")
    .insert([{ event_id: eventId, profile_id: userId, role }]);

  if (error) {
    console.error("Raw Supabase error:", error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
}

export async function removeUserFromEventSupabase(
  eventId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabaseClient.from("event_members")
    .delete()
    .eq("event_id", eventId)
    .eq("profile_id", userId);

  if (error) {
    console.error("Raw Supabase error:", error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
}

export async function editUserInEventSupabase(
  eventId: string,
  userId: string,
  role: string,
): Promise<void> {
  const { error } = await supabaseClient.from("event_members")
    .update({ role })
    .eq("event_id", eventId)
    .eq("profile_id", userId);

  if (error) {
    console.error("Raw Supabase error:", error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }
}

export async function getSupabaseEventByCoordinates(lat: number, long: number) {
  const { data, error } = await supabaseClient.rpc("nearby_events", {
    p_lat: lat,
    p_long: long,
    p_range_km: 100,
  });

  if (error) {
    console.error("Raw Supabase error(getEventsByCoordinates):", error);
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return data;
}
