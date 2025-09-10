import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('EXPO_PUBLIC_SUPABASE_URL')!,
  Deno.env.get('EXPO_PUBLIC_SUPABASE_ANON_KEY')!
);

export async function getSupabaseEventByOwner(ownerId: string): Promise<any[]> {
  const { data, error } = await supabase.from('events')
	.select('*')
	.eq('owner_id', ownerId);

  if (error) {
	console.error('Supabase error:', error);
	throw new HTTPException(500, { message: `Error fetching events: ${error.message}` });
  }

  return data;
}
