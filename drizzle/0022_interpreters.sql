CREATE TYPE "public"."interpreter_modality" AS ENUM('acting', 'narration');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "admins" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Staff check for policies and the API (RFC-006 D6). SECURITY DEFINER: admins
-- has no privileges for anon/authenticated, so nobody can read or add rows.
-- Created before the interpreter policies that call it.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT exists(SELECT 1 FROM public.admins a WHERE a.user_id = public.current_user_id())
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "public"."admins" FROM anon, authenticated;--> statement-breakpoint

CREATE TABLE "interpreter_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"modalities" "interpreter_modality"[] NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"media_path" text NOT NULL,
	"media_type" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"birth_date" date NOT NULL,
	"experience" text,
	"age_range" text,
	"languages" text,
	"drt" text,
	"consent_at" timestamp NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interpreter_profiles_media_type_check" CHECK ("interpreter_profiles"."media_type" in ('video', 'audio')),
	CONSTRAINT "interpreter_profiles_duration_check" CHECK ("interpreter_profiles"."duration_seconds" between 1 and 30),
	CONSTRAINT "interpreter_profiles_modalities_check" CHECK (cardinality("interpreter_profiles"."modalities") between 1 and 2)
);
--> statement-breakpoint
ALTER TABLE "interpreter_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpreter_profiles" ADD CONSTRAINT "interpreter_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpreter_profiles" ADD CONSTRAINT "interpreter_profiles_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interpreter_profiles_status_idx" ON "interpreter_profiles" USING btree ("status");--> statement-breakpoint
CREATE POLICY "Owners and admins read interpreter profiles" ON "interpreter_profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.current_user_id()) = user_id or (select public.is_admin()));--> statement-breakpoint
CREATE POLICY "Owners submit their interpreter profile" ON "interpreter_profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.current_user_id()) = user_id and status = 'pending' and reviewed_by is null and birth_date <= current_date - interval '18 years');--> statement-breakpoint
CREATE POLICY "Owners resubmit their interpreter profile" ON "interpreter_profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.current_user_id()) = user_id) WITH CHECK ((select public.current_user_id()) = user_id and status = 'pending' and reviewed_by is null and birth_date <= current_date - interval '18 years');--> statement-breakpoint
CREATE POLICY "Admins review interpreter profiles" ON "interpreter_profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));--> statement-breakpoint

-- Owners and admins only (policies above); the public badge goes through
-- get_interpreter_badge(), which exposes approved modalities and media only.
REVOKE ALL ON TABLE "public"."interpreter_profiles" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON TABLE "public"."interpreter_profiles" TO authenticated;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.get_interpreter_badge(p_user_id uuid)
RETURNS TABLE (modalities public.interpreter_modality[], media_path text, media_type text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT i.modalities, i.media_path, i.media_type
  FROM public.interpreter_profiles i
  WHERE i.user_id = p_user_id AND i.status = 'approved'
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_interpreter_badge(uuid) FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_interpreter_badge(uuid) TO anon, authenticated;
