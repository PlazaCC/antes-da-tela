-- Create storage buckets with public access and file size limits.
-- Upload path convention: {userId}/{timestamp}_{sanitized_filename}
-- enforced by INSERT policy: storage.foldername(name)[1] = auth.uid()::text

-- Buckets (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('scripts', 'scripts', true, 52428800,  ARRAY['application/pdf']),
  ('audio',   'audio',   true, 104857600, ARRAY['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm']),
  ('avatars', 'avatars', true, 5242880,   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public            = EXCLUDED.public,
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS policies on storage.objects (idempotent)

-- scripts bucket: public read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'scripts bucket public read'
  ) THEN
    CREATE POLICY "scripts bucket public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'scripts');
  END IF;
END $$;

-- scripts bucket: authenticated insert (own folder)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'scripts bucket authenticated insert'
  ) THEN
    CREATE POLICY "scripts bucket authenticated insert"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'scripts'
        AND storage.foldername(name) IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- scripts bucket: owner update/delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'scripts bucket owner update delete'
  ) THEN
    CREATE POLICY "scripts bucket owner update delete"
      ON storage.objects FOR ALL
      TO authenticated
      USING (
        bucket_id = 'scripts'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- audio bucket: public read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'audio bucket public read'
  ) THEN
    CREATE POLICY "audio bucket public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'audio');
  END IF;
END $$;

-- audio bucket: authenticated insert (own folder)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'audio bucket authenticated insert'
  ) THEN
    CREATE POLICY "audio bucket authenticated insert"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'audio'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- audio bucket: owner update/delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'audio bucket owner update delete'
  ) THEN
    CREATE POLICY "audio bucket owner update delete"
      ON storage.objects FOR ALL
      TO authenticated
      USING (
        bucket_id = 'audio'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- avatars bucket: public read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'avatars bucket public read'
  ) THEN
    CREATE POLICY "avatars bucket public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;
END $$;

-- avatars bucket: authenticated insert (own folder)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'avatars bucket authenticated insert'
  ) THEN
    CREATE POLICY "avatars bucket authenticated insert"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- avatars bucket: owner update/delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'avatars bucket owner update delete'
  ) THEN
    CREATE POLICY "avatars bucket owner update delete"
      ON storage.objects FOR ALL
      TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
