-- Identity resolution that works for both Supabase Auth and Clerk sessions
-- (RFC-005, phase 2). auth.uid() casts the JWT `sub` to uuid and errors on a
-- Clerk token (`sub` = 'user_...'), so policies and RPCs use this instead.
--
--   * Clerk token    → users.id of the row whose clerk_id matches `sub`
--   * Supabase token → `sub` is already users.id (legacy branch, removed in phase 4)
--
-- SECURITY DEFINER so the lookup bypasses RLS on users (no policy recursion)
-- and can read clerk_id, which is not granted to anon/authenticated.
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN coalesce(auth.jwt() ->> 'sub', '') = '' THEN NULL
    WHEN (auth.jwt() ->> 'sub') LIKE 'user\_%'
      THEN (SELECT u.id FROM public.users u WHERE u.clerk_id = auth.jwt() ->> 'sub')
    ELSE (auth.jwt() ->> 'sub')::uuid
  END
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.current_user_id() FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.current_user_id() TO anon, authenticated;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.get_my_cpf()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.cpf FROM public.users u WHERE u.id = public.current_user_id()
$$;--> statement-breakpoint

-- Legacy Supabase Storage (old content still lives there; new uploads go to S3).
-- Owner checks move from auth.uid() to current_user_id(); folder = users.id.
ALTER POLICY "scripts bucket authenticated insert" ON storage.objects
  WITH CHECK (bucket_id = 'scripts' AND (storage.foldername(name))[1] = (SELECT public.current_user_id())::text);--> statement-breakpoint
ALTER POLICY "scripts bucket owner update delete" ON storage.objects
  USING (bucket_id = 'scripts' AND (storage.foldername(name))[1] = (SELECT public.current_user_id())::text);--> statement-breakpoint
ALTER POLICY "audio bucket authenticated insert" ON storage.objects
  WITH CHECK (bucket_id = 'audio' AND (storage.foldername(name))[1] = (SELECT public.current_user_id())::text);--> statement-breakpoint
ALTER POLICY "audio bucket owner update delete" ON storage.objects
  USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = (SELECT public.current_user_id())::text);--> statement-breakpoint
ALTER POLICY "avatars bucket authenticated insert" ON storage.objects
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT public.current_user_id())::text);--> statement-breakpoint
ALTER POLICY "avatars bucket owner update delete" ON storage.objects
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT public.current_user_id())::text);
