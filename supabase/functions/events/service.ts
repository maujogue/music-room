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
