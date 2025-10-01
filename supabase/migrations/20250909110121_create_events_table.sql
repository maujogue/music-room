create table
if not exists public.events
(
    id uuid primary key default gen_random_uuid
(),
    name text unique,
    image_url text,
    description text,
    playlist_id text,
    owner_id uuid references profiles
(id) on
delete cascade,
    constraint name_length check
(char_length
(name) >= 3),
    created_at timestamp
with time zone default timezone
('utc'::text, now
()),
    beginning_at timestamp
with time zone,
    ending_at timestamp
with time zone
);

-- Junction table for event members
create table
if not exists public.event_members
(
    event_id uuid references events
(id) on
delete cascade,
    profile_id uuid
references profiles
(id) on
delete cascade,
    joined_at timestamp
with time zone default timezone
('utc'::text, now
()),
    primary key
(event_id, profile_id)
);

-- Table for event addresses
create table
if not exists public.location
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
    event_id UUID REFERENCES events
(id) ON
DELETE CASCADE unique,
    coordinates POINT,
    venueName TEXT,
    complement TEXT,
    address TEXT,
    city TEXT,
    country TEXT
);

-- Index for better query performance
create index
if not exists idx_event_members_event_id on event_members
(event_id);
create index
if not exists idx_event_members_profile_id on event_members
(profile_id);

CREATE OR REPLACE FUNCTION get_complete_event
(p_event_id UUID)
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
    SELECT *
    INTO e
    FROM events
    WHERE id = p_event_id
    LIMIT 1;
    IF NOT FOUND THEN
    RETURN NULL;
END
IF;

    -- Owner: select single profile
    SELECT json_build_object(
        'id', p.id,
        'username', p.username,
        'email', p.email,
        'avatar_url', p.avatar_url,
        'bio', p.bio,
        'music_genre', p.music_genre
    )
INTO owner_json
FROM profiles p
WHERE p.id = e.owner_id
LIMIT 1;

-- Location: single row_to_json if exists
SELECT row_to_json(l.*)
INTO location_json
FROM location l
WHERE l.event_id = p_event_id
LIMIT 1;

-- Playlist: call helper only when playlist_id present
IF e.playlist_id IS NOT NULL THEN
BEGIN
    SELECT get_playlist_complete(e.playlist_id::UUID)
    INTO playlist_json;
    EXCEPTION WHEN OTHERS THEN
        playlist_json := NULL;
END;
ELSE
      playlist_json := NULL;
END
IF;

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
            )
        )
    ), '[]'
::json)
    INTO members_json
    FROM event_members em
    JOIN profiles mp ON em.profile_id = mp.id
    WHERE em.event_id = event_id;

RETURN json_build_object(
        'event', row_to_json(e),
        'owner', owner_json,
        'location', location_json,
        'playlist', playlist_json,
        'members', members_json
    );
END;
$$;
