create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    name text unique,
    image_url text,
    description text,
    playlist_id text,
    owner_id uuid references profiles(id) on delete cascade,
    constraint name_length check (char_length(name) >= 3),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    beginning_at timestamp with time zone,
    ending_at timestamp with time zone
);

-- Junction table for event members
create table if not exists public.event_members (
    event_id uuid references events(id) on delete cascade,
    profile_id uuid references profiles(id) on delete cascade,
    joined_at timestamp with time zone default timezone('utc'::text, now()),
    primary key (event_id, profile_id)
);

-- Table for event addresses
create table if not exists public.location (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE unique,
    coordinates POINT,
    venueName TEXT,
    complement TEXT,
    address TEXT,
    city TEXT,
    country TEXT
);

-- Index for better query performance
create index if not exists idx_event_members_event_id on event_members(event_id);
create index if not exists idx_event_members_profile_id on event_members(profile_id);

CREATE OR REPLACE FUNCTION get_complete_event(event_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Construction du JSON avec toutes les relations
    SELECT json_build_object(
        'event', row_to_json(e.*),
        'owner', row_to_json(p.*),
        'location', row_to_json(a.*),
        'members', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'joined_at', em.joined_at,
                    'profile', row_to_json(mp.*)
                )
            ), '[]'::json)
            FROM event_members em
            JOIN profiles mp ON em.profile_id = mp.id
            WHERE em.event_id = $1
        )
    ) INTO result
    FROM events e
    LEFT JOIN profiles p ON e.owner_id = p.id
    LEFT JOIN location a ON e.id = a.event_id
    WHERE e.id = $1;

    RETURN result;
END;
$$;
