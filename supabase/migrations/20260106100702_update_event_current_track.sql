-- Add metadata columns to event_current_track
ALTER TABLE IF EXISTS event_current_track
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS artists_names TEXT[] DEFAULT '{}'::text[];

-- Backfill existing rows with empty array for artists_names if NULL (safe no-op)
UPDATE event_current_track
SET artists_names = '{}'::text[]
WHERE artists_names IS NULL;

-- Optionally, create an index on event_current_track(event_id) is already primary key; index for searches on track_id may be useful
-- CREATE INDEX IF NOT EXISTS idx_event_current_track_track_id ON event_current_track (track_id);
