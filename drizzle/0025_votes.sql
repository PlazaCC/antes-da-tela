CREATE TABLE "call_votes" (
	"call_id" uuid NOT NULL,
	"entry_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "call_votes_call_id_user_id_pk" PRIMARY KEY("call_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "call_votes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "calls" ADD COLUMN "winner_entry_id" uuid;--> statement-breakpoint
ALTER TABLE "calls" ADD COLUMN "live_at" timestamp;--> statement-breakpoint
ALTER TABLE "calls" ADD COLUMN "live_url" text;--> statement-breakpoint
ALTER TABLE "calls" ADD COLUMN "ticket_url" text;--> statement-breakpoint
ALTER TABLE "calls" ADD COLUMN "ticket_price_cents" integer;--> statement-breakpoint
ALTER TABLE "calls" ADD COLUMN "cast_share_percent" integer;--> statement-breakpoint
ALTER TABLE "calls" ADD COLUMN "recording_url" text;--> statement-breakpoint
ALTER TABLE "call_votes" ADD CONSTRAINT "call_votes_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_votes" ADD CONSTRAINT "call_votes_entry_id_call_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."call_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_votes" ADD CONSTRAINT "call_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "call_votes_entry_idx" ON "call_votes" USING btree ("entry_id");--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_winner_entry_id_call_entries_id_fk" FOREIGN KEY ("winner_entry_id") REFERENCES "public"."call_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Users read their own votes" ON "call_votes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.current_user_id()) = user_id);--> statement-breakpoint
CREATE POLICY "Documented users vote once while the call is voting" ON "call_votes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.current_user_id()) = user_id
        and exists(select 1 from user_documents d where d.user_id = call_votes.user_id)
        and exists(select 1 from call_entries e join calls c on c.id = e.call_id
          where e.id = entry_id and e.call_id = call_votes.call_id and e.status = 'approved' and c.phase = 'voting'));--> statement-breakpoint

REVOKE ALL ON TABLE "public"."call_votes" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT ON TABLE "public"."call_votes" TO authenticated;--> statement-breakpoint

-- Vote totals per approved entry: public once the call is finished, admins any time.
CREATE OR REPLACE FUNCTION public.call_vote_counts(p_call_id uuid)
RETURNS TABLE (entry_id uuid, votes bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT e.id, count(v.user_id)
  FROM public.call_entries e
  JOIN public.calls c ON c.id = e.call_id
  LEFT JOIN public.call_votes v ON v.entry_id = e.id
  WHERE e.call_id = p_call_id AND e.status = 'approved'
    AND (c.phase = 'finished' OR public.is_admin())
  GROUP BY e.id
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.call_vote_counts(uuid) FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.call_vote_counts(uuid) TO anon, authenticated;--> statement-breakpoint

-- The chosen cast of a call's entries (selected takes), public from the voting
-- phase on: shown on the vote and winner pages.
CREATE OR REPLACE FUNCTION public.get_call_cast(p_call_id uuid)
RETURNS TABLE (entry_id uuid, character_id uuid, character_name text, interpreter_id uuid, interpreter_name text, media_path text, media_type text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT e.id, ch.id, ch.name, u.id, coalesce(u.display_name, u.name), s.media_path, s.media_type
  FROM public.casting_submissions s
  JOIN public.call_characters ch ON ch.id = s.character_id
  JOIN public.call_entries e ON e.id = ch.entry_id
  JOIN public.calls c ON c.id = e.call_id
  JOIN public.users u ON u.id = s.interpreter_id
  WHERE e.call_id = p_call_id AND e.status = 'approved' AND s.status = 'selected'
    AND c.phase IN ('voting', 'finished')
  ORDER BY ch.sort_order
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_call_cast(uuid) FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_call_cast(uuid) TO anon, authenticated;
