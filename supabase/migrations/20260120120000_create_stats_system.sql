-- Create played_tracks_history table
CREATE TABLE IF NOT EXISTS public.played_tracks_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_played_tracks_history_event_id ON played_tracks_history(event_id);
CREATE INDEX IF NOT EXISTS idx_played_tracks_history_track_id ON played_tracks_history(track_id);
-- Index for time-based queries if needed later
CREATE INDEX IF NOT EXISTS idx_played_tracks_history_played_at ON played_tracks_history(played_at DESC);

-- Enable RLS
ALTER TABLE public.played_tracks_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view history for public events? Or just members? Let's say members/owner.
-- For now let's keep it simple: if you can view the event, you can view the history. But we don't strictly need client-side access to this table raw, so we can restrict it.
-- Allow service role full access.
CREATE POLICY "Service role full access" ON public.played_tracks_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to record history when current track updates
CREATE OR REPLACE FUNCTION public.handle_event_track_change_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only insert if there is a new track and it's different from the old one (or old was null)
  IF NEW.track_id IS NOT NULL AND (OLD.track_id IS NULL OR NEW.track_id IS DISTINCT FROM OLD.track_id) THEN
      INSERT INTO public.played_tracks_history (event_id, track_id)
      VALUES (NEW.event_id, NEW.track_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on event_current_track
DROP TRIGGER IF EXISTS trg_track_history_on_change ON public.event_current_track;
CREATE TRIGGER trg_track_history_on_change
  AFTER INSERT OR UPDATE ON public.event_current_track
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_event_track_change_history();


-- Function: get_user_stats
-- Returns aggregations for the user.
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_playlists_count BIGINT;
  v_events_participated BIGINT;
  v_votes_cast BIGINT;
  v_successful_votes BIGINT;
  v_most_voted_tracks JSON;
BEGIN
  -- 1. Number of playlists owned
  SELECT COUNT(*) INTO v_playlists_count
  FROM playlists
  WHERE owner_id = p_user_id;

  -- 2. Number of events participated in (as member or owner)
  -- Owner is not always in event_members, need to check relationships.
  -- Actually owners ARE usually implicit members or explicitly added.
  -- Let's use get_user_events logic or just check event_members + ownership.
  SELECT COUNT(DISTINCT event_id) INTO v_events_participated
  FROM (
    SELECT event_id FROM event_members WHERE profile_id = p_user_id
    UNION
    SELECT id as event_id FROM events WHERE owner_id = p_user_id
  ) sub;

  -- 3. Total votes cast (sum of vote_count in event_members)
  -- This is technically "active votes in current events" if vote_count is reset.
  -- The requirement says "number of songs that you voted for that got played".
  -- We don't have a granular vote history table that persists FOREVER for every single vote action?
  -- Wait, `track_votes` has `voters` array. We can count occurrences of user_id in `voters` arrays across all `track_votes`?
  -- But `track_votes` might be cleared after event? No, usually kept.
  -- But better metric might be from `event_members.vote_count` accumulation if we tracked "lifetime votes".
  -- Limitation: We only have `track_votes` for current state of events usually.
  -- Let's check `track_votes` table. It has `voters uuid[]`.
  SELECT COUNT(*) INTO v_votes_cast
  FROM track_votes, unnest(voters) as v
  WHERE v = p_user_id;

  -- 4. Successful votes: Number of songs you voted for that got played.
  -- Join played_tracks_history with track_votes.
  -- Track votes might be deleted or we might not link them easily if history doesn't store voters.
  -- Limitation: track_tracks_history doesn't store who voted for it.
  -- However, track_votes (if not deleted) stores who voted for `track_id` in `event_id`.
  -- So we can join `played_tracks_history` with `track_votes`.
  SELECT COUNT(*) INTO v_successful_votes
  FROM played_tracks_history h
  JOIN track_votes tv ON h.event_id = tv.event_id AND h.track_id = tv.track_id
  WHERE p_user_id = ANY(tv.voters);

  -- 5. Most voted songs (top 5)
  -- Agregates from track_votes where user is in voters.
  SELECT json_agg(t) INTO v_most_voted_tracks
  FROM (
      SELECT track_id, COUNT(*) as my_vote_count
      FROM track_votes, unnest(voters) as v
      WHERE v = p_user_id
      GROUP BY track_id
      ORDER BY my_vote_count DESC
      LIMIT 5
  ) t;

  RETURN json_build_object(
    'playlists_count', v_playlists_count,
    'events_participated', v_events_participated,
    'votes_cast', v_votes_cast,
    'successful_votes', v_successful_votes,
    'most_voted_tracks', COALESCE(v_most_voted_tracks, '[]'::json)
  );
END;
$$;


-- Function: get_friends_leaderboard
-- compares stats with friends (mutual follows).
CREATE OR REPLACE FUNCTION get_friends_leaderboard(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Get list of friends (mutual follows) + self
  WITH friend_ids AS (
    SELECT following_id as user_id
    FROM follows
    WHERE follower_id = p_user_id
    INTERSECT
    SELECT follower_id as user_id
    FROM follows
    WHERE following_id = p_user_id
    UNION
    SELECT p_user_id as user_id
  ),
  stats_raw AS (
     SELECT
        fid.user_id,
        p.username,
        p.avatar_url,
        (
           SELECT COUNT(*)
           FROM played_tracks_history h
           JOIN track_votes tv ON h.event_id = tv.event_id AND h.track_id = tv.track_id
           WHERE fid.user_id = ANY(tv.voters)
        ) as successful_votes,
        (
            SELECT COUNT(*)
            FROM track_votes, unnest(voters) as v
            WHERE v = fid.user_id
        ) as total_votes,
        (
             SELECT COUNT(DISTINCT event_id)
            FROM (
                SELECT event_id FROM event_members WHERE profile_id = fid.user_id
                UNION
                SELECT id as event_id FROM events WHERE owner_id = fid.user_id
            ) sub
        ) as events_count
     FROM friend_ids fid
     JOIN profiles p ON p.id = fid.user_id
  )
  SELECT json_agg(stats_raw ORDER BY successful_votes DESC) INTO v_result
  FROM stats_raw;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;
