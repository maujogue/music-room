-- Activer pgcrypto pour gen_random_uuid()
CREATE EXTENSION
IF NOT EXISTS pgcrypto;

-- Désactiver temporairement le RLS sur profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Création de 50 users dans auth.users
INSERT INTO auth.users
  (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
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

-- Création de 10 événements avec des utilisateurs comme owners
-- ...existing code...

-- Création de 10 événements avec des utilisateurs comme owners
INSERT INTO public.events
  (name, description, playlist_id, owner_id, beginning_at, ending_at, image_url)
SELECT
  event_data.name,
  event_data.description,
  event_data.playlist_id,
  p.id as owner_id,
  event_data.beginning_at::timestamp with time zone,
  event_data.ending_at::timestamp with time zone,
  event_data.image_url
FROM (
    VALUES
    ('Summer Music Festival', 'A vibrant outdoor music festival featuring various genres', '37i9dQZF1DX0XUsuxWHRQd', (SELECT id FROM public.profiles WHERE username = 'alice' LIMIT 1), '2024-07-15 14:00:00+00', '2024-07-15 23:00:00+00', 'https://example.com/summer-fest.jpg'),
    ('Jazz Night at the Blue Note', 'Intimate jazz session with local musicians', '37i9dQZF1DX7YCknf2jT6s', (SELECT id FROM public.profiles WHERE username = 'bob' LIMIT 1), '2024-06-20 19:00:00+00', '2024-06-20 23:30:00+00', 'https://example.com/jazz-night.jpg'),
    ('Electronic Dance Party', 'High-energy electronic music event', '37i9dQZF1DX6ALfRUiP9ey', (SELECT id FROM public.profiles WHERE username = 'carol' LIMIT 1), '2024-08-10 21:00:00+00', '2024-08-11 03:00:00+00', 'https://example.com/edm-party.jpg'),
    ('Acoustic Coffee House', 'Cozy acoustic performances with coffee and pastries', '37i9dQZF1DWWqJHtf5kRtI', (SELECT id FROM public.profiles WHERE username = 'dave' LIMIT 1), '2024-05-25 16:00:00+00', '2024-05-25 20:00:00+00', 'https://example.com/acoustic-cafe.jpg'),
    ('Rock Revival Concert', 'Classic and modern rock hits all night long', '37i9dQZF1DWXRqgorJj26U', (SELECT id FROM public.profiles WHERE username = 'eve' LIMIT 1), '2024-09-05 18:00:00+00', '2024-09-05 22:30:00+00', 'https://example.com/rock-revival.jpg'),
    ('Hip-Hop Block Party', 'Street culture celebration with hip-hop beats', '37i9dQZF1DX0XUfTFmNdCA', (SELECT id FROM public.profiles WHERE username = 'frank' LIMIT 1), '2024-07-30 15:00:00+00', '2024-07-30 21:00:00+00', 'https://example.com/hiphop-block.jpg'),
    ('Classical Symphony Evening', 'Beautiful classical music performances', '37i9dQZF1DWWEJlAGA9gs0', (SELECT id FROM public.profiles WHERE username = 'grace' LIMIT 1), '2024-06-12 19:30:00+00', '2024-06-12 22:00:00+00', 'https://example.com/classical-symphony.jpg'),
    ('Indie Music Showcase', 'Discover new independent artists and bands', '37i9dQZF1DX26DKvjp0s9M', (SELECT id FROM public.profiles WHERE username = 'heidi' LIMIT 1), '2024-08-22 20:00:00+00', '2024-08-23 01:00:00+00', 'https://example.com/indie-showcase.jpg'),
    ('Latin Fiesta', 'Salsa, reggaeton, and Latin pop celebration', '37i9dQZF1DX10zKzsJ2jva', (SELECT id FROM public.profiles WHERE username = 'ivan' LIMIT 1), '2024-09-15 17:00:00+00', '2024-09-15 23:00:00+00', 'https://example.com/latin-fiesta.jpg'),
    ('Chill Lounge Session', 'Relaxing ambient and lounge music experience', '37i9dQZF1DX3YSRoSdA634', (SELECT id FROM public.profiles WHERE username = 'judy' LIMIT 1), '2024-10-01 18:30:00+00', '2024-10-01 22:00:00+00', 'https://example.com/chill-lounge.jpg')
) AS event_data(name, description, playlist_id, owner_id, beginning_at, ending_at, image_url)
JOIN public.profiles p ON p.id = event_data.owner_id;

-- Réactiver le RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
