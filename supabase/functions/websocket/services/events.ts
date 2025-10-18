import { formatDbError } from '../../../utils/postgres_errors_map.tsx';

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function getEventSupabase(eventId: string, selectFields = '*') {
    try {
        const { data, error } = await supabase
        .from('events')
        .select(selectFields)
        .eq('id', eventId)
        .single();

        if (error) {
            console.error('Error fetching event:', error);
            return { success: false, message: formatDbError(error).message };
        }
        if (!data) {
            return { success: false, message: 'Event not found' };
        }
        return { success: true, data };
    } catch (error) {
        console.error('Unexpected error fetching event:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function getEventMemberDetails(eventId: string, userId: string): Promise<{
    success: boolean;
    data?: {
        profile_id: string;
        max_votes: number;
        vote_count: number;
        voted_tracks: Record<string, number>;
    };
    message?: string
}> {
    try {
        const { data, error } = await supabase
            .from('event_members')
            .select('profile_id, max_votes, vote_count')
            .eq('event_id', eventId)
            .eq('profile_id', userId)
            .single();

        if (error) {
            console.error('Error fetching event member details:', error);
            return { success: false, message: formatDbError(error).message };
        }
        if (!data) {
            return { success: false, message: 'Event member not found' };
        }

        const { data: votesData, error: votesError } = await supabase
            .from('track_votes')
            .select('track_id, voters')
            .eq('event_id', eventId);

        if (votesError) {
            console.error('Error fetching voted tracks:', votesError);
            return { success: false, message: formatDbError(votesError).message };
        }

        const voted_tracks: Record<string, number> = {};
        if (votesData) {
            for (const vote of votesData) {
            const voters = vote.voters ?? [];
            const count = voters.reduce((acc: number, v: any) => {
                if (typeof v === 'string') return acc + (v === userId ? 1 : 0);
                if (v && (v.id === userId || v.user_id === userId)) return acc + 1;
                return acc;
            }, 0);
            if (count > 0) voted_tracks[vote.track_id] = count;
            }
        }

        return { success: true, data: { ...data, voted_tracks } };
    } catch (error) {
        console.error('Unexpected error fetching event member details:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
