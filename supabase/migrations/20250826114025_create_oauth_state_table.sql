create table if not exists public.oauth_state (
    id uuid primary key default gen_random_uuid(),
    state text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
