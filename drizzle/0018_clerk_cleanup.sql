-- RFC-005 phase 4 (cleanup). Clerk is the only login; this ends the rollback
-- path to Supabase Auth.

-- 1. current_user_id(): drop the legacy Supabase-token branch. Only Clerk
--    tokens (`sub` = 'user_...') resolve to a users.id; anything else is NULL.
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.id FROM public.users u
  WHERE u.clerk_id = (auth.jwt() ->> 'sub')
    AND (auth.jwt() ->> 'sub') LIKE 'user\_%'
$$;--> statement-breakpoint

-- 2. email is no longer publicly readable (no client upsert uses
--    EXCLUDED.email anymore; getAppUser reads the e-mail from Clerk).
REVOKE SELECT ON TABLE "public"."users" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT ("id", "name", "image", "bio", "created_at", "deactivated_at") ON TABLE "public"."users" TO anon, authenticated;--> statement-breakpoint

-- 3. Writes: rows are created/linked only by the service role (Clerk sync).
--    Owners may update just their profile fields; id, email and clerk_id are
--    no longer writable from the client.
REVOKE INSERT, UPDATE ON TABLE "public"."users" FROM anon, authenticated;--> statement-breakpoint
GRANT UPDATE ("name", "image", "bio", "cpf", "deactivated_at") ON TABLE "public"."users" TO authenticated;--> statement-breakpoint

-- 4. Storage policies created outside the migrations (dashboard) that still
--    use auth.uid(), which errors on a Clerk token. The migrated policies
--    ("<bucket> bucket ...", 0016) cover the same cases.
DROP POLICY IF EXISTS "Authenticated users can upload scripts" ON storage.objects;--> statement-breakpoint
DROP POLICY IF EXISTS "Users manage their own script files" ON storage.objects;--> statement-breakpoint
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;--> statement-breakpoint
DROP POLICY IF EXISTS "Users manage their own audio files" ON storage.objects;--> statement-breakpoint
DROP POLICY IF EXISTS "Authenticated users can upload their avatar" ON storage.objects;--> statement-breakpoint
DROP POLICY IF EXISTS "Users manage their own avatar" ON storage.objects;
