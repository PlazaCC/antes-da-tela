CREATE TYPE "public"."casting_status" AS ENUM('submitted', 'shortlisted', 'selected', 'rejected');--> statement-breakpoint
CREATE TABLE "casting_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"interpreter_id" uuid NOT NULL,
	"media_path" text NOT NULL,
	"media_type" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"note" text,
	"status" "casting_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "casting_submissions_media_type_check" CHECK ("casting_submissions"."media_type" in ('video', 'audio')),
	CONSTRAINT "casting_submissions_duration_check" CHECK ("casting_submissions"."duration_seconds" between 1 and 30)
);
--> statement-breakpoint
ALTER TABLE "casting_submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "casting_submissions" ADD CONSTRAINT "casting_submissions_character_id_call_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."call_characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting_submissions" ADD CONSTRAINT "casting_submissions_interpreter_id_users_id_fk" FOREIGN KEY ("interpreter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "casting_submissions_character_interpreter_unique" ON "casting_submissions" USING btree ("character_id","interpreter_id");--> statement-breakpoint
CREATE POLICY "Interpreters, admins and (shortlisted) authors read castings" ON "casting_submissions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.current_user_id()) = interpreter_id or (select public.is_admin())
        or (status in ('shortlisted', 'selected') and exists(select 1 from call_characters ch join call_entries e on e.id = ch.entry_id
          where ch.id = character_id and e.author_id = (select public.current_user_id()))));--> statement-breakpoint
CREATE POLICY "Approved interpreters send castings while the call is casting" ON "casting_submissions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.current_user_id()) = interpreter_id and status = 'submitted'
        and exists(select 1 from interpreter_profiles i where i.user_id = interpreter_id and i.status = 'approved')
        and exists(select 1 from call_characters ch join call_entries e on e.id = ch.entry_id join calls c on c.id = e.call_id
          where ch.id = character_id and e.status = 'approved' and c.phase = 'casting'));--> statement-breakpoint
CREATE POLICY "Interpreters replace their take while the call is casting" ON "casting_submissions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.current_user_id()) = interpreter_id and status = 'submitted') WITH CHECK ((select public.current_user_id()) = interpreter_id and status = 'submitted'
        and exists(select 1 from call_characters ch join call_entries e on e.id = ch.entry_id join calls c on c.id = e.call_id
          where ch.id = character_id and c.phase = 'casting'));--> statement-breakpoint
CREATE POLICY "Interpreters withdraw their take while the call is casting" ON "casting_submissions" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.current_user_id()) = interpreter_id and status = 'submitted'
        and exists(select 1 from call_characters ch join call_entries e on e.id = ch.entry_id join calls c on c.id = e.call_id
          where ch.id = character_id and c.phase = 'casting'));--> statement-breakpoint
CREATE POLICY "Admins curate castings" ON "casting_submissions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));--> statement-breakpoint

REVOKE ALL ON TABLE "public"."casting_submissions" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."casting_submissions" TO authenticated;--> statement-breakpoint

-- E6: the entry's author picks the cast among the shortlisted takes, while the
-- call is in `curation`. SECURITY DEFINER because authors have no UPDATE on
-- castings; every condition is checked here. One selected take per character.
CREATE OR REPLACE FUNCTION public.select_cast(p_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_character_id uuid;
BEGIN
  SELECT s.character_id INTO v_character_id
  FROM public.casting_submissions s
  JOIN public.call_characters ch ON ch.id = s.character_id
  JOIN public.call_entries e ON e.id = ch.entry_id
  JOIN public.calls c ON c.id = e.call_id
  WHERE s.id = p_submission_id
    AND s.status IN ('shortlisted', 'selected')
    AND e.author_id = public.current_user_id()
    AND c.phase = 'curation';

  IF v_character_id IS NULL THEN
    RAISE EXCEPTION 'cast selection not allowed' USING ERRCODE = '42501';
  END IF;

  UPDATE public.casting_submissions
  SET status = 'shortlisted', updated_at = now()
  WHERE character_id = v_character_id AND status = 'selected' AND id <> p_submission_id;

  UPDATE public.casting_submissions
  SET status = 'selected', updated_at = now()
  WHERE id = p_submission_id;
END
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.select_cast(uuid) FROM PUBLIC, anon;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.select_cast(uuid) TO authenticated;
