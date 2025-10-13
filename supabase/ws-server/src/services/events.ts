import { formatDbError } from '../../../utils/postgres_errors_map.tsx';

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "http://localhost:54321";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function getEventSupabase(eventId: string) {
    try {
        const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

        if (error) {
            console.error('Error fetching event:', error);
            return { success: false, message: formatDbError(error).message };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Unexpected error fetching event:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
