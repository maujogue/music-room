-- Add tables to realtime publication for realtime subscriptions
-- These tables are used by the application for realtime updates

-- Add event_current_track table for realtime track updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_current_track;

-- Add profiles table for realtime profile updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Add follows table for realtime follow/unfollow updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
