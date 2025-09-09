create table if not exists public.events (
    id uuid not null primary key,
    name text unique,
    owner uuid references profiles(id) on delete cascade,
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

-- Index for better query performance
create index if not exists idx_event_members_event_id on event_members(event_id);
create index if not exists idx_event_members_profile_id on event_members(profile_id);
