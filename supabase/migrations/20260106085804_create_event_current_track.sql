CREATE TABLE IF NOT EXISTS event_current_track (
    event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE UNIQUE,
    track_id TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    vote_resolved BOOLEAN DEFAULT FALSE
);

-- Trigger function: when track_id changes, mark vote_resolved = false
CREATE OR REPLACE FUNCTION notify_vote_resolved_on_track_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND (OLD.track_id IS DISTINCT FROM NEW.track_id) THEN
        NEW.vote_resolved = FALSE;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_event_current_track_track_change ON event_current_track;
CREATE TRIGGER trg_event_current_track_track_change
BEFORE UPDATE ON event_current_track
FOR EACH ROW
WHEN (OLD.track_id IS DISTINCT FROM NEW.track_id)
EXECUTE FUNCTION notify_vote_resolved_on_track_change();

-- Notify via pg_notify so realtime listeners (or custom listeners) can react when track_id changes
CREATE OR REPLACE FUNCTION notify_event_current_track_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_notify(
        'event_current_track_changes',
        json_build_object(
            'event_id', NEW.event_id,
            'track_id', NEW.track_id,
            'updated_at', NEW.updated_at,
            'vote_resolved', NEW.vote_resolved
        )::text
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_event_current_track_notify_change ON event_current_track;
CREATE TRIGGER trg_event_current_track_notify_change
AFTER INSERT ON event_current_track
FOR EACH ROW
EXECUTE FUNCTION notify_event_current_track_change();

DROP TRIGGER IF EXISTS trg_event_current_track_notify_change_update ON event_current_track;
CREATE TRIGGER trg_event_current_track_notify_change_update
AFTER UPDATE ON event_current_track
FOR EACH ROW
WHEN (OLD.track_id IS DISTINCT FROM NEW.track_id)
EXECUTE FUNCTION notify_event_current_track_change();