CREATE TYPE "public"."user_intent" AS ENUM('reader', 'producer', 'interpreter');--> statement-breakpoint
CREATE TABLE "user_onboarding" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"intents" "user_intent"[] DEFAULT '{}'::user_intent[] NOT NULL,
	"gender" text,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_onboarding" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"genres" text[] DEFAULT '{}'::text[] NOT NULL,
	"formats" text[] DEFAULT '{}'::text[] NOT NULL,
	"themes" text[] DEFAULT '{}'::text[] NOT NULL,
	"goals" text[] DEFAULT '{}'::text[] NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pronouns" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "links" jsonb;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Owners manage their own onboarding" ON "user_onboarding" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select public.current_user_id()) = user_id) WITH CHECK ((select public.current_user_id()) = user_id);--> statement-breakpoint
CREATE POLICY "Owners manage their own preferences" ON "user_preferences" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select public.current_user_id()) = user_id) WITH CHECK ((select public.current_user_id()) = user_id);--> statement-breakpoint

-- New public profile columns: SELECT on users is granted per column (0014).
GRANT SELECT ("display_name", "pronouns", "location", "links") ON TABLE "public"."users" TO anon, authenticated;--> statement-breakpoint

-- Private tables: nothing for anon; the owner policies above scope authenticated.
REVOKE ALL ON TABLE "public"."user_onboarding" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."user_onboarding" TO authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "public"."user_preferences" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."user_preferences" TO authenticated;
