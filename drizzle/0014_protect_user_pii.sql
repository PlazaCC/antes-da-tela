-- Protect personal data (LGPD) on public.users.
--
-- The "Users are publicly readable" policy lets anyone holding the publishable
-- key SELECT every column of public.users, including cpf. RLS is row-level
-- only, so we restrict the readable columns with column privileges: anon and
-- authenticated can SELECT every column except cpf.
-- INSERT/UPDATE privileges are unchanged (owners still write their own cpf).
--
-- email stays readable for now: the login/script upserts run
-- ON CONFLICT DO UPDATE SET email = EXCLUDED.email, which needs SELECT on
-- email. It will be locked down with the Clerk migration (RFC-005).
REVOKE SELECT ON TABLE "public"."users" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT ("id", "name", "email", "image", "bio", "created_at", "deactivated_at") ON TABLE "public"."users" TO anon, authenticated;--> statement-breakpoint

-- The owner reads their own CPF through this function (never another user's).
CREATE OR REPLACE FUNCTION public.get_my_cpf()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.cpf FROM public.users u WHERE u.id = auth.uid()
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_my_cpf() FROM PUBLIC, anon;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_my_cpf() TO authenticated;
