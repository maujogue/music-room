import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { formatDbError } from '../../utils/postgres_errors_map.tsx'

const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SECRET_SERVICE_ROLE_KEY')!;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function createSupabaseEvent(eventData: EventPayload): Promise<any> {
  const { location, ...eventDetails } = eventData;

  const { data, error } = await supabaseClient.from('events')
    .insert([eventDetails])
    .select();

  if (error) {
    const pgError = formatDbError(error);
    console.error('Mapped PG error:', pgError);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  if (location) {
    const locationData = { ...location, event_id: data[0].id };
    const { error: locationError } = await supabaseClient.from('location')
      .insert([locationData])
      .select();

    if (locationError) {
      const pgError = formatDbError(locationError);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }
  }

  return data;
}

export async function getSupabaseEventById(eventId: string): Promise<any> {
  const { data, error } = await supabaseClient.rpc('get_complete_event', { event_id: eventId });

  if (error) {
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  console.log('Fetched event data:', data);
  return data;
}

export async function getSupabaseEventByOwner(ownerId: string): Promise<any[]> {
  const { data, error } = await supabaseClient.from('events')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) {
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: `Error fetching events: ${pgError.message}` });
  }

  return data;
}

export async function deleteSupabaseEventById(eventId: string): Promise<boolean> {
  const { error } = await supabaseClient.from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    const pgError = formatDbError(error);
    throw new HTTPException(pgError.status, { message: pgError.message });
  }

  return true;
}

export async function updateSupabaseEventById(
  eventId: string,
  eventData?: Record<string, any>,
  locationData?: Record<string, any>
): Promise<{ event: any; location: any }> {
  console.log('Updating event:', eventId, eventData, locationData);

  let eventResult = null;
  let locationResult = null;

  if (eventData && Object.keys(eventData).length > 0) {
    const { data, error } = await supabaseClient
      .from('events')
      .update(eventData)
      .eq('id', eventId)
      .select();

    if (error) {
      const pgError = formatDbError(error);
      console.error('Supabase event update error:', pgError.message);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }
    eventResult = data;
  }

  if (locationData && Object.keys(locationData).length > 0) {
    const { data, error } = await supabaseClient
      .from('location')
      .update(locationData)
      .eq('event_id', eventId)
      .select();

    if (error) {
      const pgError = formatDbError(error);
      console.error('Supabase location update error:', pgError.message);
      throw new HTTPException(pgError.status, { message: pgError.message });
    }
    locationResult = data;
  }

  return { event: eventResult, location: locationResult };
}


