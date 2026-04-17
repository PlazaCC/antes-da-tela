-- Storage bucket visibility — ADR-001 specifies all buckets as public: true.
-- Public buckets allow getPublicUrl() to serve PDFs and media without authentication.
-- Unauthenticated users can read; uploads are still restricted to authenticated users
-- via the existing RLS policies on storage.objects.
UPDATE storage.buckets
SET public = true
WHERE id IN ('scripts', 'audio', 'avatars');
