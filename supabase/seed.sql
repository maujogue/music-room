-- Seed data for the Music Room app
-- This file runs after migrations to populate the database with initial data
-- Insert a few test users into auth.users and profiles.
-- Note: In production, user creation should go through Supabase Auth.
-- For local development/testing only.
-- Create test users in auth.users
insert into
    auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at
    )
values
    (
        '11111111-1111-1111-1111-111111111111',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'alice@musicroom.com',
        crypt ('alice123', gen_salt ('bf')),
        now (),
        now (),
        now (),
        now (),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Alice Example","avatar_url":"https://i.pravatar.cc/150?img=1"}',
        false,
        now (),
        now ()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'bob@musicroom.com',
        crypt ('bob123', gen_salt ('bf')),
        now (),
        now (),
        now (),
        now (),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Bob Example","avatar_url":"https://i.pravatar.cc/150?img=2"}',
        false,
        now (),
        now ()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'carol@musicroom.com',
        crypt ('carol123', gen_salt ('bf')),
        now (),
        now (),
        now (),
        now (),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Carol Example","avatar_url":"https://i.pravatar.cc/150?img=3"}',
        false,
        now (),
        now ()
    ) on conflict (id) do nothing;

-- Insert matching profiles for test users
insert into
    public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        created_at,
        updated_at
    )
values
    (
        '11111111-1111-1111-1111-111111111111',
        'alice@musicroom.com',
        'Alice Example',
        'https://i.pravatar.cc/150?img=1',
        now (),
        now ()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'bob@musicroom.com',
        'Bob Example',
        'https://i.pravatar.cc/150?img=2',
        now (),
        now ()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'carol@musicroom.com',
        'Carol Example',
        'https://i.pravatar.cc/150?img=3',
        now (),
        now ()
    ) on conflict (id) do nothing;

-- You can add more seed data below as needed.