-- Migration: Make the `avatars` storage bucket public
-- Sets the bucket `public` flag and creates a SELECT policy on storage.objects
-- limited to objects belonging to the `avatars` bucket.

BEGIN;

-- Mark the avatars bucket as public so public URLs can be served
UPDATE storage.buckets
SET "public" = TRUE
WHERE name = 'avatars';

-- Ensure a policy exists that allows public SELECT on objects in the avatars bucket
-- We drop existing policy with the same name to make this migration idempotent.
DROP POLICY IF EXISTS "public_select_avatars" ON storage.objects;

CREATE POLICY "public_select_avatars"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = (
      SELECT id FROM storage.buckets WHERE name = 'avatars'
    )
  );

COMMIT;
