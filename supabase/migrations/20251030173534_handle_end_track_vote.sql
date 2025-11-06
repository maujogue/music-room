CREATE OR REPLACE FUNCTION public.get_event_winner(p_event_id UUID)
RETURNS TABLE (
  track_id TEXT,
  vote_count INTEGER,
  title TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  rec RECORD;
  track_title TEXT;
BEGIN
  -- Choisit le track avec le plus de votes; si égalité, prend le plus ancien (first_added)
  SELECT
    track_id,
    vote_count,
    MIN(created_at) AS first_added
  INTO rec
  FROM public.track_votes
  WHERE event_id = p_event_id
  GROUP BY track_id, vote_count
  ORDER BY vote_count DESC, first_added ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN; -- pas de votes pour cet event
  END IF;

  -- Essaye d'appeler une fonction helper get_track_title si elle existe
  BEGIN
    EXECUTE 'SELECT public.get_track_title($1)' INTO track_title USING rec.track_id;
  EXCEPTION WHEN undefined_function THEN
    track_title := NULL;
  END;

  RETURN QUERY
  SELECT rec.track_id, rec.vote_count, track_title;
END;
$$;