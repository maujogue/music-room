-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE,
  image_url text,
  description text,
  playlist_id text,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  constraint name_length CHECK (char_length(name) >= 3),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  beginning_at timestamp with time zone NOT NULL,
  ending_at timestamp with time zone NOT NULL,
  is_private boolean DEFAULT false,
  everyone_can_vote boolean DEFAULT true
);

-- Junction table for event members
CREATE TABLE IF NOT EXISTS public.event_members (
  role text DEFAULT 'member' CHECK (role IN ('member', 'voter', 'inviter', 'collaborator')),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (event_id, profile_id)
);

-- Table for event addresses
CREATE TABLE IF NOT EXISTS public.location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  coordinates POINT,
  venueName TEXT,
  complement TEXT,
  address TEXT,
  city TEXT,
  country TEXT
);

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
  SELECT row_to_json(l.*) INTO location_json
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
