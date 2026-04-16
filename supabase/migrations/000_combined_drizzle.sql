-- Combined Drizzle SQL migrations (0000 -> 0003)

-- 0000_cuddly_phantom_reporter.sql
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- 0001_free_gladiator.sql
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update their own data" ON "users" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 0002_hot_landau.sql
CREATE TABLE "audio_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"duration_seconds" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "audio_files" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"page_number" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);

ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"score" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "ratings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "script_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"file_size" integer,
	"page_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "script_files" ENABLE ROW LEVEL SECURITY;

-- Ensure enum type exists before creating the scripts table so policies
-- can be defined against the correct type without requiring ALTERs.
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_type t
		JOIN pg_namespace n ON t.typnamespace = n.oid
		WHERE t.typname = 'script_status' AND n.nspname = 'public'
	) THEN
		EXECUTE 'CREATE TYPE "public"."script_status" AS ENUM (''draft'', ''published'')';
	END IF;
END
$$;

CREATE TABLE "scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"logline" text,
	"synopsis" text,
	"genre" text,
	"age_rating" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" "public"."script_status" DEFAULT 'published'::"public"."script_status" NOT NULL,
	"author_id" uuid NOT NULL,
	"banner_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);

ALTER TABLE "scripts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "users" ADD COLUMN "bio" text;

ALTER TABLE "audio_files" ADD CONSTRAINT "audio_files_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "comments" ADD CONSTRAINT "comments_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "ratings" ADD CONSTRAINT "ratings_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "script_files" ADD CONSTRAINT "script_files_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "scripts" ADD CONSTRAINT "scripts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

CREATE UNIQUE INDEX "ratings_script_user_unique" ON "ratings" USING btree ("script_id","user_id");

CREATE POLICY "Users are publicly readable" ON "users" AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "Audio files are publicly readable" ON "audio_files" AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "Authors manage their audio files" ON "audio_files" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = (select author_id from scripts where id = script_id)) WITH CHECK (auth.uid() = (select author_id from scripts where id = script_id));

CREATE POLICY "Comments on published scripts are publicly readable" ON "comments" AS PERMISSIVE FOR SELECT TO public USING (deleted_at is null);

CREATE POLICY "Authenticated users can create comments" ON "comments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors manage their own comments" ON "comments" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Ratings are publicly readable" ON "ratings" AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users manage their own ratings" ON "ratings" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Script files follow script visibility" ON "script_files" AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "Authors manage their script files" ON "script_files" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = (select author_id from scripts where id = script_id)) WITH CHECK (auth.uid() = (select author_id from scripts where id = script_id));

CREATE POLICY "Published scripts are publicly readable" ON "scripts" AS PERMISSIVE FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Authors manage their own scripts" ON "scripts" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- ratings score range
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_score_range" CHECK ("ratings"."score" >= 1 AND "ratings"."score" <= 5);
