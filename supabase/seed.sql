-- Activer pgcrypto pour gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Désactiver temporairement le RLS sur profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Création de 50 users dans auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES
  (gen_random_uuid(), 'alice@example.com', 'fakehash', now(), '{"username":"alice"}'),
  (gen_random_uuid(), 'bob@example.com', 'fakehash', now(), '{"username":"bob"}'),
  (gen_random_uuid(), 'carol@example.com', 'fakehash', now(), '{"username":"carol"}'),
  (gen_random_uuid(), 'dave@example.com', 'fakehash', now(), '{"username":"dave"}'),
  (gen_random_uuid(), 'eve@example.com', 'fakehash', now(), '{"username":"eve"}'),
  (gen_random_uuid(), 'frank@example.com', 'fakehash', now(), '{"username":"frank"}'),
  (gen_random_uuid(), 'grace@example.com', 'fakehash', now(), '{"username":"grace"}'),
  (gen_random_uuid(), 'heidi@example.com', 'fakehash', now(), '{"username":"heidi"}'),
  (gen_random_uuid(), 'ivan@example.com', 'fakehash', now(), '{"username":"ivan"}'),
  (gen_random_uuid(), 'judy@example.com', 'fakehash', now(), '{"username":"judy"}'),
  (gen_random_uuid(), 'karen@example.com', 'fakehash', now(), '{"username":"karen"}'),
  (gen_random_uuid(), 'leo@example.com', 'fakehash', now(), '{"username":"leo"}'),
  (gen_random_uuid(), 'mike@example.com', 'fakehash', now(), '{"username":"mike"}'),
  (gen_random_uuid(), 'nina@example.com', 'fakehash', now(), '{"username":"nina"}'),
  (gen_random_uuid(), 'oscar@example.com', 'fakehash', now(), '{"username":"oscar"}'),
  (gen_random_uuid(), 'peggy@example.com', 'fakehash', now(), '{"username":"peggy"}'),
  (gen_random_uuid(), 'quentin@example.com', 'fakehash', now(), '{"username":"quentin"}'),
  (gen_random_uuid(), 'rachel@example.com', 'fakehash', now(), '{"username":"rachel"}'),
  (gen_random_uuid(), 'steve@example.com', 'fakehash', now(), '{"username":"steve"}'),
  (gen_random_uuid(), 'trudy@example.com', 'fakehash', now(), '{"username":"trudy"}'),
  (gen_random_uuid(), 'ursula@example.com', 'fakehash', now(), '{"username":"ursula"}'),
  (gen_random_uuid(), 'victor@example.com', 'fakehash', now(), '{"username":"victor"}'),
  (gen_random_uuid(), 'wendy@example.com', 'fakehash', now(), '{"username":"wendy"}'),
  (gen_random_uuid(), 'xander@example.com', 'fakehash', now(), '{"username":"xander"}'),
  (gen_random_uuid(), 'yvonne@example.com', 'fakehash', now(), '{"username":"yvonne"}'),
  (gen_random_uuid(), 'zack@example.com', 'fakehash', now(), '{"username":"zack"}'),
  (gen_random_uuid(), 'amy@example.com', 'fakehash', now(), '{"username":"amy"}'),
  (gen_random_uuid(), 'brian@example.com', 'fakehash', now(), '{"username":"brian"}'),
  (gen_random_uuid(), 'cindy@example.com', 'fakehash', now(), '{"username":"cindy"}'),
  (gen_random_uuid(), 'derek@example.com', 'fakehash', now(), '{"username":"derek"}'),
  (gen_random_uuid(), 'elaine@example.com', 'fakehash', now(), '{"username":"elaine"}'),
  (gen_random_uuid(), 'fred@example.com', 'fakehash', now(), '{"username":"fred"}'),
  (gen_random_uuid(), 'gina@example.com', 'fakehash', now(), '{"username":"gina"}'),
  (gen_random_uuid(), 'harry@example.com', 'fakehash', now(), '{"username":"harry"}'),
  (gen_random_uuid(), 'irene@example.com', 'fakehash', now(), '{"username":"irene"}'),
  (gen_random_uuid(), 'jack@example.com', 'fakehash', now(), '{"username":"jack"}'),
  (gen_random_uuid(), 'katie@example.com', 'fakehash', now(), '{"username":"katie"}'),
  (gen_random_uuid(), 'louis@example.com', 'fakehash', now(), '{"username":"louis"}'),
  (gen_random_uuid(), 'mia@example.com', 'fakehash', now(), '{"username":"mia"}'),
  (gen_random_uuid(), 'nick@example.com', 'fakehash', now(), '{"username":"nick"}'),
  (gen_random_uuid(), 'olivia@example.com', 'fakehash', now(), '{"username":"olivia"}'),
  (gen_random_uuid(), 'paul@example.com', 'fakehash', now(), '{"username":"paul"}'),
  (gen_random_uuid(), 'quinn@example.com', 'fakehash', now(), '{"username":"quinn"}'),
  (gen_random_uuid(), 'randy@example.com', 'fakehash', now(), '{"username":"randy"}'),
  (gen_random_uuid(), 'susan@example.com', 'fakehash', now(), '{"username":"susan"}'),
  (gen_random_uuid(), 'tom@example.com', 'fakehash', now(), '{"username":"tom"}'),
  (gen_random_uuid(), 'uma@example.com', 'fakehash', now(), '{"username":"uma"}'),
  (gen_random_uuid(), 'victoria@example.com', 'fakehash', now(), '{"username":"victoria"}'),
  (gen_random_uuid(), 'will@example.com', 'fakehash', now(), '{"username":"will"}'),
  (gen_random_uuid(), 'xenia@example.com', 'fakehash', now(), '{"username":"xenia"}');

-- Les profiles sont créés automatiquement par le trigger handle_new_user()

-- Optionnel : mettre à jour les bios et genres
UPDATE public.profiles
SET bio = 'This is a test bio',
    music_genre = ARRAY['pop','rock']
WHERE username IN ('alice','bob','carol','dave','eve','frank','grace','heidi','ivan','judy','karen','leo','mike','nina','oscar','peggy','quentin','rachel','steve','trudy','ursula','victor','wendy','xander','yvonne','zack','amy','brian','cindy','derek','elaine','fred','gina','harry','irene','jack','katie','louis','mia','nick','olivia','paul','quinn','randy','susan','tom','uma','victoria','will','xenia');

-- Création de 10 playlists avec différents propriétaires
INSERT INTO public.playlists (name, description, owner_id, is_private, is_collaborative, cover_url)
SELECT
  playlist_data.name,
  playlist_data.description,
  playlist_data.owner_id,
  playlist_data.is_private,
  playlist_data.is_collaborative,
  playlist_data.cover_url
FROM (
  VALUES
    ('Summer Vibes 2024', 'Perfect tracks for sunny days and beach parties', (SELECT id FROM auth.users WHERE email = 'alice@example.com' LIMIT 1), false, true, 'https://picsum.photos/300/300?random=1'),
    ('Jazz Classics', 'Timeless jazz standards from the greatest artists', (SELECT id FROM auth.users WHERE email = 'bob@example.com' LIMIT 1), false, true, 'https://picsum.photos/300/300?random=2'),
    ('Electronic Dreams', 'Ambient and electronic music for deep focus', (SELECT id FROM auth.users WHERE email = 'carol@example.com' LIMIT 1), true, false, 'https://picsum.photos/300/300?random=3'),
    ('Acoustic Sessions', 'Unplugged and intimate acoustic performances', (SELECT id FROM auth.users WHERE email = 'dave@example.com' LIMIT 1), false, true, 'https://picsum.photos/300/300?random=4'),
    ('Rock Anthems', 'The greatest rock songs of all time', (SELECT id FROM auth.users WHERE email = 'eve@example.com' LIMIT 1), false, true, 'https://picsum.photos/300/300?random=5'),
    ('Hip-Hop Heat', 'Latest and greatest hip-hop tracks', (SELECT id FROM auth.users WHERE email = 'frank@example.com' LIMIT 1), false, true, 'https://picsum.photos/300/300?random=6'),
    ('My Secret Playlist', 'Personal favorites - keep it private', (SELECT id FROM auth.users WHERE email = 'grace@example.com' LIMIT 1), true, false, 'https://picsum.photos/300/300?random=7'),
    ('Indie Discoveries', 'Hidden gems from independent artists', (SELECT id FROM auth.users WHERE email = 'heidi@example.com' LIMIT 1), false, true, 'https://picsum.photos/300/300?random=8'),
    ('Latin Rhythms', 'Salsa, reggaeton, and Latin pop hits', (SELECT id FROM auth.users WHERE email = 'ivan@example.com' LIMIT 1), false, true, 'https://picsum.photos/300/300?random=9'),
    ('Chill & Relax', 'Peaceful music for meditation and relaxation', (SELECT id FROM auth.users WHERE email = 'judy@example.com' LIMIT 1), false, false, 'https://picsum.photos/300/300?random=10')
) AS playlist_data(name, description, owner_id, is_private, is_collaborative, cover_url);

INSERT INTO public.events (name, description, owner_id, playlist_id, beginning_at, is_private, everyone_can_vote)
SELECT
  event_data.name,
  event_data.description,
  event_data.owner_id,
  event_data.playlist_id,
  event_data.beginning_at,
  event_data.is_private,
  event_data.everyone_can_vote
FROM (
  VALUES
    (
      'Summer Bash 2024',
      'Join us for an unforgettable summer party with great music!',
      (SELECT id FROM auth.users WHERE email = 'alice@example.com' LIMIT 1),
      (SELECT id FROM public.playlists WHERE name = 'Summer Vibes 2024' LIMIT 1),
      NOW(), false, true
    ),
    (
      'Jazz Night',
      'An evening of smooth jazz and good vibes.',
      (SELECT id FROM auth.users WHERE email = 'bob@example.com' LIMIT 1),
      (SELECT id FROM public.playlists WHERE name = 'Jazz Classics' LIMIT 1),
      NOW(), false, true
    ),
    (
      'Electronic Music Festival',
      'Experience the best of electronic music with top DJs.',
      (SELECT id FROM auth.users WHERE email = 'carol@example.com' LIMIT 1),
      (SELECT id FROM public.playlists WHERE name = 'Electronic Dreams' LIMIT 1),
      NOW(), false, true
    ),
    (
      'Acoustic Evening',
      'Enjoy intimate acoustic performances by talented artists.',
      (SELECT id FROM auth.users WHERE email = 'dave@example.com' LIMIT 1),
      (SELECT id FROM public.playlists WHERE name = 'Acoustic Sessions' LIMIT 1),
      NOW(), false, true
    ),
    (
      'Rock Concert',
      'Get ready to rock with some of the best rock bands.',
      (SELECT id FROM auth.users WHERE email = 'eve@example.com' LIMIT 1),
      (SELECT id FROM public.playlists WHERE name = 'Rock Anthems' LIMIT 1),
      NOW(), false, true
    )
) AS event_data(name, description, owner_id, playlist_id, beginning_at, is_private, everyone_can_vote);

-- Insert locations for the events around a given point (lat 37.387183, lon -122.078489)
-- Use small offsets so events are spread around the point for testing nearby queries
INSERT INTO public.location (id, event_id, coordinates, venueName, address, city, country)
VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM public.events WHERE name = 'Summer Bash 2024' LIMIT 1),
    gis.ST_GeogFromText('SRID=4326;POINT(-122.078489 37.387183)'),
    'Downtown Plaza',
    '100 Main St',
    'Mountain View',
    'USA'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.events WHERE name = 'Jazz Night' LIMIT 1),
    gis.ST_GeogFromText('SRID=4326;POINT(-122.079000 37.387500)'),
    'Jazz Corner',
    '200 Jazz Ave',
    'Mountain View',
    'USA'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.events WHERE name = 'Electronic Music Festival' LIMIT 1),
    gis.ST_GeogFromText('SRID=4326;POINT(-122.077800 37.386900)'),
    'Festival Grounds',
    '300 Electron Blvd',
    'Mountain View',
    'USA'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.events WHERE name = 'Acoustic Evening' LIMIT 1),
    gis.ST_GeogFromText('SRID=4326;POINT(-122.078200 37.386600)'),
    'Acoustic Garden',
    '400 Acoustic Ln',
    'Mountain View',
    'USA'
  );

-- Réactiver le RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
