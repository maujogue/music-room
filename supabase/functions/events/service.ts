import { Hono } from 'jsr:@hono/hono'
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SECRET_SERVICE_ROLE_KEY')!;
const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function createSupabaseEvent(eventData: any): Promise<any> {
  console.log('Creating event with data:', eventData);
  const { data, error } = await supabaseClient.from('events')
    .insert([eventData])
    .select();

  if (error) {
    console.error('Supabase error:', error);
    throw new HTTPException(500, { message: `Error creating event: ${error.message}` });
  }

  return data;
}

export async function getSupabaseEventById(eventId: string): Promise<any> {
  const { data, error } = await supabaseClient.rpc('get_complete_event', { event_id: eventId });

  if (error) {
    console.error('Supabase error:', error);
    throw new HTTPException(500, { message: `Error fetching event: ${error.message}` });
  }

  return data;
}

export async function getSupabaseEventByOwner(ownerId: string): Promise<any[]> {
  const { data, error } = await supabaseClient.from('events')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) {
    console.error('Supabase error:', error);
    throw new HTTPException(500, { message: `Error fetching events: ${error.message}` });
  }

  return data;
}

export async function deleteSupabaseEventById(eventId: string): Promise<boolean> {
  const { error } = await supabaseClient.from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Supabase error:', error);
    throw new HTTPException(500, { message: `Error deleting event: ${error.message}` });
  }

  return true;
}

export async function updateSupabaseEventById(eventId: string, eventData: any, locationData: any): Promise<any> {
  const { data, error } = await supabaseClient
    .from('events')
    .update(eventData)
    .eq('id', eventId)
    .select();

  const { data: locData, error: locError } = await supabaseClient
    .from('location')
    .update(locationData)
    .eq('event_id', eventId)
    .select();

  if (error || locError) {
    console.error('Supabase error:', error || locError);
    throw new HTTPException(500, { message: `Error updating event: ${error?.message || locError?.message}` });
  }
  return data;
}
