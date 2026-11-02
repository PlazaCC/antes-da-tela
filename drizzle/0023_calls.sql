CREATE TYPE "public"."call_phase" AS ENUM('draft', 'submissions', 'casting', 'curation', 'voting', 'finished');--> statement-breakpoint
CREATE TABLE "call_characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"apparent_age" text,
	"gender" text,
	"traits" text[] DEFAULT '{}'::text[] NOT NULL,
	"modalities" "interpreter_modality"[] NOT NULL,
	"reference" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "call_characters_modalities_check" CHECK (cardinality("call_characters"."modalities") between 1 and 2)
);
--> statement-breakpoint
ALTER TABLE "call_characters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "call_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_id" uuid NOT NULL,
	"script_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"review_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "call_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"partner" text,
	"rules" text,
	"phase" "call_phase" DEFAULT 'draft' NOT NULL,
	"submissions_end_at" timestamp,
	"casting_end_at" timestamp,
	"voting_start_at" timestamp,
	"voting_end_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "calls_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "calls" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "call_characters" ADD CONSTRAINT "call_characters_entry_id_call_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."call_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_entries" ADD CONSTRAINT "call_entries_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_entries" ADD CONSTRAINT "call_entries_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_entries" ADD CONSTRAINT "call_entries_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "call_characters_entry_idx" ON "call_characters" USING btree ("entry_id");--> statement-breakpoint
CREATE UNIQUE INDEX "call_entries_call_script_unique" ON "call_entries" USING btree ("call_id","script_id");--> statement-breakpoint
CREATE INDEX "call_entries_author_idx" ON "call_entries" USING btree ("author_id");--> statement-breakpoint
CREATE POLICY "Call characters follow entry visibility" ON "call_characters" AS PERMISSIVE FOR SELECT TO public USING (exists(select 1 from call_entries e where e.id = entry_id));--> statement-breakpoint
CREATE POLICY "Authors edit characters while submissions are open" ON "call_characters" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists(select 1 from call_entries e join calls c on c.id = e.call_id
        where e.id = entry_id and e.author_id = (select public.current_user_id()) and c.phase = 'submissions')) WITH CHECK (exists(select 1 from call_entries e join calls c on c.id = e.call_id
        where e.id = entry_id and e.author_id = (select public.current_user_id()) and c.phase = 'submissions'));--> statement-breakpoint
CREATE POLICY "Approved entries are public, own and admin always" ON "call_entries" AS PERMISSIVE FOR SELECT TO public USING (status = 'approved' or (select public.current_user_id()) = author_id or (select public.is_admin()));--> statement-breakpoint
CREATE POLICY "Authors enter their published scripts while submissions are open" ON "call_entries" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.current_user_id()) = author_id and status = 'pending' and review_reason is null
        and exists(select 1 from scripts s where s.id = script_id and s.author_id = call_entries.author_id and s.status = 'published')
        and exists(select 1 from calls c where c.id = call_id and c.phase = 'submissions'));--> statement-breakpoint
CREATE POLICY "Authors withdraw pending entries while submissions are open" ON "call_entries" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.current_user_id()) = author_id and status = 'pending'
        and exists(select 1 from calls c where c.id = call_id and c.phase = 'submissions'));--> statement-breakpoint
CREATE POLICY "Admins review entries" ON "call_entries" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));--> statement-breakpoint
CREATE POLICY "Published calls are publicly readable" ON "calls" AS PERMISSIVE FOR SELECT TO public USING (phase <> 'draft' or (select public.is_admin()));--> statement-breakpoint
CREATE POLICY "Admins manage calls" ON "calls" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));--> statement-breakpoint

-- Explicit privileges; RLS above decides the rows.
REVOKE ALL ON TABLE "public"."calls", "public"."call_entries", "public"."call_characters" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT ON TABLE "public"."calls", "public"."call_entries", "public"."call_characters" TO anon, authenticated;--> statement-breakpoint
GRANT INSERT, UPDATE, DELETE ON TABLE "public"."calls" TO authenticated;--> statement-breakpoint
GRANT INSERT, UPDATE, DELETE ON TABLE "public"."call_entries" TO authenticated;--> statement-breakpoint
GRANT INSERT, UPDATE, DELETE ON TABLE "public"."call_characters" TO authenticated;
