-- Create a dedicated separate schema
create schema if not exists "gis";
-- Enable the "postgis" extension
create extension postgis with schema "gis";

GRANT USAGE ON SCHEMA gis TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA gis TO authenticated, service_role;

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE,
  image_url text,
  description text,
  playlist_id text NOT NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  constraint name_length CHECK (char_length(name) >= 3),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  beginning_at timestamp with time zone NOT NULL,
  is_private boolean DEFAULT false,
  everyone_can_vote boolean DEFAULT true,
  spatio_licence boolean DEFAULT false,
  done boolean DEFAULT false
);

-- Junction table for event members
CREATE TABLE IF NOT EXISTS public.event_members (
  role text DEFAULT 'member' CHECK (role IN ('member', 'voter', 'inviter', 'collaborator')),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  vote_count integer DEFAULT 0,
  max_votes integer DEFAULT 5,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (event_id, profile_id)
);

-- Table for event addresses
CREATE TABLE IF NOT EXISTS public.location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  coordinates gis.geography(POINT) NOT NULL,
  venueName TEXT,
  complement TEXT,
  address TEXT,
  city TEXT,
  country TEXT
);

create index location_geo_index
  on public.location
  using GIST (coordinates);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_members_event_id ON event_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_members_profile_id ON event_members(profile_id);

-- Function: get_complete_event
CREATE OR REPLACE FUNCTION get_complete_event(p_event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  e RECORD;
  owner_json JSON;
  location_json JSON;
  playlist_json JSON;
  members_json JSON;
BEGIN
  -- Retrieve single event row
  SELECT * INTO e FROM events WHERE id = p_event_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Owner: select single profile
  SELECT json_build_object(
    'id', p.id,
    'username', p.username,
    'email', p.email,
    'avatar_url', p.avatar_url,
    'bio', p.bio,
    'music_genre', p.music_genre
  ) INTO owner_json
  FROM profiles p
  WHERE p.id = e.owner_id
  LIMIT 1;

  -- Location: single row_to_json if exists
  SELECT jsonb_build_object(
    'venuename', l.venuename,
    'coordinates', jsonb_build_object(
      'lat', gis.ST_Y(l.coordinates::gis.geometry),
      'long', gis.ST_X(l.coordinates::gis.geometry)
    ),
    'complement', l.complement,
    'city', l.city,
    'country', l.country,
    'address', l.address
  ) INTO location_json 
  FROM location l
  WHERE l.event_id = p_event_id
  LIMIT 1;

  -- Playlist: call helper only when playlist_id present
  IF e.playlist_id IS NOT NULL THEN
    BEGIN
      SELECT get_playlist_complete(e.playlist_id::UUID) INTO playlist_json;
    EXCEPTION WHEN OTHERS THEN
      playlist_json := NULL;
    END;
  ELSE
    playlist_json := NULL;
  END IF;

  -- Members: aggregate into array
  SELECT COALESCE(json_agg(
    json_build_object(
      'joined_at', em.joined_at,
      'profile', json_build_object(
        'id', mp.id,
        'username', mp.username,
        'email', mp.email,
        'avatar_url', mp.avatar_url,
        'bio', mp.bio,
        'music_genre', mp.music_genre
      ),
      'role', em.role
    )
  ), '[]'::json)
  INTO members_json
  FROM event_members em
  JOIN profiles mp ON em.profile_id = mp.id
  WHERE em.event_id = p_event_id;

  RETURN json_build_object(
    'event', row_to_json(e),
    'owner', owner_json,
    'location', location_json,
    'playlist', playlist_json,
    'members', members_json
  );
END;
$$;

-- Function: get_user_events (events where user is owner or member)
CREATE OR REPLACE FUNCTION get_user_events(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res JSON;
BEGIN
  WITH user_events AS (
    SELECT id::uuid FROM events WHERE owner_id = p_user_id
    UNION
    SELECT event_id::uuid AS id FROM event_members WHERE profile_id = p_user_id
  )
  SELECT COALESCE(json_agg(get_complete_event(u.id)), '[]'::json) INTO res
  FROM (SELECT DISTINCT id FROM user_events) u;

  RETURN res;
END;
$$;

-- Table for track votes in events
CREATE TABLE IF NOT EXISTS public.track_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  track_id text NOT NULL,
  vote_count integer DEFAULT 0 NOT NULL,
  voters uuid[] DEFAULT '{}' NOT NULL, -- Array of user IDs who voted for this track
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(event_id, track_id) -- Une entrée par track par event
);

-- Index for performance on track_votes
CREATE INDEX IF NOT EXISTS idx_track_votes_event_id ON track_votes(event_id);
CREATE INDEX IF NOT EXISTS idx_track_votes_track_id ON track_votes(track_id);
CREATE INDEX IF NOT EXISTS idx_track_votes_vote_count ON track_votes(vote_count DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.track_votes;

-- Function to handle track vote changes and broadcast to realtime
CREATE OR REPLACE FUNCTION public.handle_track_vote_changes()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  event_record RECORD;
  owner_id UUID;
  member_ids UUID[];
  recipient_id UUID;
  old_voters UUID[];
  new_voters UUID[];
  voter_id UUID;
BEGIN
  -- Get the event record
  SELECT e.* INTO event_record
  FROM events e
  WHERE e.id = COALESCE(NEW.event_id, OLD.event_id);

  IF NOT FOUND THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get the owner_id from the event record
  owner_id := event_record.owner_id;

  -- Get all members of the event
  SELECT ARRAY_AGG(em.profile_id) INTO member_ids
  FROM event_members em
  WHERE em.event_id = event_record.id;

  -- Determine who voted (for new votes, find the difference in voters arrays)
  old_voters := COALESCE(OLD.voters, '{}');
  new_voters := COALESCE(NEW.voters, '{}');

  -- For INSERT or UPDATE, find the voter who was added
  IF TG_OP = 'INSERT' THEN
    -- On insert, the last voter in the array is the new one
    IF array_length(new_voters, 1) > 0 THEN
      voter_id := new_voters[array_length(new_voters, 1)];
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- On update, find the voter that was added (difference between arrays)
    SELECT unnest INTO voter_id
    FROM unnest(new_voters)
    WHERE unnest != ALL(old_voters)
    LIMIT 1;
  END IF;

  -- Broadcast to owner
  IF owner_id IS NOT NULL THEN
    PERFORM pg_notify(
      'track_vote_changes:' || owner_id::text,
      json_build_object(
        'type', 'track_vote:' || TG_OP,
        'event_id', event_record.id,
        'event_name', event_record.name,
        'track_id', COALESCE(NEW.track_id, OLD.track_id),
        'vote_count', COALESCE(NEW.vote_count, OLD.vote_count, 0),
        'voters', COALESCE(NEW.voters, OLD.voters, '{}'),
        'voter_id', voter_id,
        'timestamp', now()
      )::text
    );
  END IF;

  -- Broadcast to all members
  IF member_ids IS NOT NULL THEN
    FOREACH recipient_id IN ARRAY member_ids
    LOOP
      PERFORM pg_notify(
        'track_vote_changes:' || recipient_id::text,
        json_build_object(
          'type', 'track_vote:' || TG_OP,
          'event_id', event_record.id,
          'event_name', event_record.name,
          'track_id', COALESCE(NEW.track_id, OLD.track_id),
          'vote_count', COALESCE(NEW.vote_count, OLD.vote_count, 0),
          'voters', COALESCE(NEW.voters, OLD.voters, '{}'),
          'voter_id', voter_id,
          'timestamp', now()
        )::text
      );
    END LOOP;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for track vote changes
CREATE TRIGGER track_votes_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.track_votes
  FOR EACH ROW EXECUTE FUNCTION handle_track_vote_changes();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to automatically update updated_at
CREATE TRIGGER track_votes_updated_at_trigger
  BEFORE UPDATE ON public.track_votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update vote_count in event_members when track votes change
CREATE OR REPLACE FUNCTION public.update_member_vote_count()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  event_id_val UUID;
  old_voters UUID[];
  new_voters UUID[];
BEGIN
  -- Get the event_id from the affected row
  event_id_val := COALESCE(NEW.event_id, OLD.event_id);

  IF TG_OP = 'INSERT' THEN
    -- Get new voters array
    new_voters := COALESCE(NEW.voters, '{}');

    -- ✅ Pour INSERT, compter les votes de chaque utilisateur
    WITH vote_counts AS (
      SELECT user_id, COUNT(*) as vote_count
      FROM unnest(new_voters) AS user_id
      GROUP BY user_id
    )
    -- Incrémenter le vote_count selon le nombre de votes
    INSERT INTO event_members (event_id, profile_id, vote_count)
    SELECT event_id_val, vc.user_id, vc.vote_count
    FROM vote_counts vc
    ON CONFLICT (event_id, profile_id)
    DO UPDATE SET vote_count = event_members.vote_count + EXCLUDED.vote_count;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Get old and new voters arrays
    old_voters := COALESCE(OLD.voters, '{}');
    new_voters := COALESCE(NEW.voters, '{}');

    -- ✅ Pour les votes multiples, calculer la différence de nombre de votes par utilisateur
    -- Compter les votes de chaque utilisateur dans l'ancien et le nouveau array
    WITH old_counts AS (
      SELECT user_id, COUNT(*) as vote_count
      FROM unnest(old_voters) AS user_id
      GROUP BY user_id
    ),
    new_counts AS (
      SELECT user_id, COUNT(*) as vote_count
      FROM unnest(new_voters) AS user_id
      GROUP BY user_id
    ),
    vote_changes AS (
      SELECT
        COALESCE(n.user_id, o.user_id) as user_id,
        COALESCE(n.vote_count, 0) - COALESCE(o.vote_count, 0) as vote_diff
      FROM new_counts n
      FULL OUTER JOIN old_counts o ON n.user_id = o.user_id
      WHERE COALESCE(n.vote_count, 0) != COALESCE(o.vote_count, 0)
    )
    -- Mettre à jour le vote_count pour chaque utilisateur selon la différence
    UPDATE event_members em
    SET vote_count = GREATEST(em.vote_count + vc.vote_diff, 0)
    FROM vote_changes vc
    WHERE em.event_id = event_id_val
    AND em.profile_id = vc.user_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Get old voters array
    old_voters := COALESCE(OLD.voters, '{}');

    -- ✅ DELETE : décrémenter selon le nombre de votes par utilisateur
    WITH vote_counts AS (
      SELECT user_id, COUNT(*) as vote_count
      FROM unnest(old_voters) AS user_id
      GROUP BY user_id
    )
    -- Décrémenter le vote_count selon le nombre de votes
    UPDATE event_members em
    SET vote_count = GREATEST(em.vote_count - vc.vote_count, 0)
    FROM vote_counts vc
    WHERE em.event_id = event_id_val
    AND em.profile_id = vc.user_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update member vote counts when track votes change
CREATE TRIGGER update_member_vote_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.track_votes
  FOR EACH ROW EXECUTE FUNCTION update_member_vote_count();

-- Function to get member vote statistics for an event
CREATE OR REPLACE FUNCTION get_event_member_votes(p_event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'user_id', em.profile_id,
        'username', p.username,
        'vote_count', em.vote_count,
        'max_votes', em.max_votes,
        'remaining_votes', GREATEST(em.max_votes - em.vote_count, 0),
        'joined_at', em.joined_at
      )
    )
    FROM event_members em
    JOIN profiles p ON em.profile_id = p.id
    WHERE em.event_id = p_event_id
    ORDER BY em.vote_count DESC, p.username ASC
  );
END;
$$;

-- Function to check if a user can still vote in an event
CREATE OR REPLACE FUNCTION can_user_vote(p_event_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_record RECORD;
  event_record RECORD;
BEGIN
  -- Get event info
  SELECT * INTO event_record FROM events WHERE id = p_event_id;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if everyone can vote (public event)
  IF event_record.everyone_can_vote THEN
    -- For public events, check if user has exceeded max votes (default 5)
    SELECT * INTO member_record
    FROM event_members
    WHERE event_id = p_event_id AND profile_id = p_user_id;

    IF FOUND THEN
      RETURN member_record.vote_count < member_record.max_votes;
    ELSE
      -- User not in members table, insert them with default values
      INSERT INTO event_members (event_id, profile_id, vote_count, max_votes)
      VALUES (p_event_id, p_user_id, 0, 5);
      RETURN TRUE;
    END IF;
  ELSE
    -- For private events, user must be a member or owner
    IF event_record.owner_id = p_user_id THEN
      -- Owner can always vote, check their vote count
      SELECT * INTO member_record
      FROM event_members
      WHERE event_id = p_event_id AND profile_id = p_user_id;

      IF FOUND THEN
        RETURN member_record.vote_count < member_record.max_votes;
      ELSE
        -- Owner not in members table, insert them
        INSERT INTO event_members (event_id, profile_id, vote_count, max_votes)
        VALUES (p_event_id, p_user_id, 0, 5);
        RETURN TRUE;
      END IF;
    ELSE
      -- Check if user is a member
      SELECT * INTO member_record
      FROM event_members
      WHERE event_id = p_event_id AND profile_id = p_user_id;

      IF FOUND THEN
        RETURN member_record.vote_count < member_record.max_votes;
      ELSE
        RETURN FALSE;  -- Not a member of private event
      END IF;
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION nearby_events(p_lat FLOAT, p_long FLOAT, p_range_km INTEGER)
RETURNS TABLE (
  id UUID,
  name TEXT,
  beginning_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  venuename TEXT,
  everyone_can_vote BOOLEAN,
  image_url TEXT,
  spatio_licence BOOLEAN,
  done BOOLEAN,
  lat FLOAT,
  long FLOAT,
  dist_meters FLOAT,
  owner_id UUID,
  owner_username TEXT,
  owner_avatar_url TEXT
)
LANGUAGE sql
AS $$
  SELECT
    e.id,
    e.name,
    e.beginning_at,
    e.description,
    l.venuename,
    e.everyone_can_vote,
    e.image_url,
    e.spatio_licence,
    e.done,
    gis.st_y(l.coordinates::gis.geometry) AS lat,
    gis.st_x(l.coordinates::gis.geometry) AS long,
    gis.st_distance(
      l.coordinates,
      gis.st_setsrid(gis.st_makepoint(p_long, p_lat), 4326)::gis.geography
    ) AS dist_meters,
    p.id as owner_id,
    p.username as owner_username,
    p.avatar_url as owner_avatar_url
  FROM public.events e
  JOIN public.location l ON l.event_id = e.id
  JOIN public.profiles p ON p.id = e.owner_id
  WHERE gis.st_distance(
    l.coordinates,
    gis.st_setsrid(gis.st_makepoint(p_long, p_lat), 4326)::gis.geography
  ) <= p_range_km * 1000
  AND NOT e.is_private
  ORDER BY l.coordinates operator(gis.<->) gis.st_point(p_long, p_lat)::gis.geography;
$$;
