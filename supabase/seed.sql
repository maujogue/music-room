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

-- Réactiver le RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
