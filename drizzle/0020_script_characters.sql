CREATE TABLE "script_characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"apparent_age" text,
	"gender" text,
	"traits" text[] DEFAULT '{}'::text[] NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "script_characters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "script_characters" ADD CONSTRAINT "script_characters_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "script_characters_script_id_idx" ON "script_characters" USING btree ("script_id");--> statement-breakpoint
CREATE POLICY "Script characters follow script visibility" ON "script_characters" AS PERMISSIVE FOR SELECT TO public USING (exists(select 1 from scripts where id = script_id and (status = 'published' or (select public.current_user_id()) = author_id)));--> statement-breakpoint
CREATE POLICY "Authors manage their script characters" ON "script_characters" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select public.current_user_id()) = (select author_id from scripts where id = script_id)) WITH CHECK ((select public.current_user_id()) = (select author_id from scripts where id = script_id));--> statement-breakpoint

-- Public read follows script visibility (policy above); writes are author-only.
GRANT SELECT ON TABLE "public"."script_characters" TO anon, authenticated;--> statement-breakpoint
GRANT INSERT, UPDATE, DELETE ON TABLE "public"."script_characters" TO authenticated;--> statement-breakpoint

-- Trait suggestions (LinkedIn-skills style): the traits authors already use,
-- ranked by popularity and grouped case-insensitively. SECURITY INVOKER keeps
-- RLS in force, so only characters of visible scripts (published or own) count.
CREATE OR REPLACE FUNCTION public.search_character_traits(search text DEFAULT '', max_results integer DEFAULT 10)
RETURNS TABLE (trait text, uses bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT min(t.trait) AS trait, count(*) AS uses
  FROM public.script_characters c, unnest(c.traits) AS t(trait)
  WHERE coalesce(search, '') = '' OR strpos(lower(t.trait), lower(search)) > 0
  GROUP BY lower(t.trait)
  ORDER BY count(*) DESC, lower(t.trait)
  LIMIT least(greatest(coalesce(max_results, 10), 1), 20);
$$;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.search_character_traits(text, integer) TO anon, authenticated;
