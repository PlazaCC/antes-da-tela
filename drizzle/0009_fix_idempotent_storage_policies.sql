-- Migration: Make storage RLS policies idempotent
-- The original migration (0008) used bare CREATE POLICY which fails on re-run.
-- This migration recreates all storage policies using DROP IF EXISTS + CREATE
-- so the migration history is safe to replay in fresh environments (CI, staging, etc.).

-- scripts bucket
DROP POLICY IF EXISTS "scripts bucket public read" ON storage.objects;
CREATE POLICY "scripts bucket public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'scripts');

DROP POLICY IF EXISTS "scripts bucket authenticated insert" ON storage.objects;
CREATE POLICY "scripts bucket authenticated insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'scripts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "scripts bucket owner update delete" ON storage.objects;
CREATE POLICY "scripts bucket owner update delete" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'scripts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- audio bucket
DROP POLICY IF EXISTS "audio bucket public read" ON storage.objects;
CREATE POLICY "audio bucket public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

DROP POLICY IF EXISTS "audio bucket authenticated insert" ON storage.objects;
CREATE POLICY "audio bucket authenticated insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "audio bucket owner update delete" ON storage.objects;
CREATE POLICY "audio bucket owner update delete" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- avatars bucket
DROP POLICY IF EXISTS "avatars bucket public read" ON storage.objects;
CREATE POLICY "avatars bucket public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars bucket authenticated insert" ON storage.objects;
CREATE POLICY "avatars bucket authenticated insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars bucket owner update delete" ON storage.objects;
CREATE POLICY "avatars bucket owner update delete" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);