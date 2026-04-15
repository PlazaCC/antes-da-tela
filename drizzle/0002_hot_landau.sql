CREATE TABLE "audio_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"duration_seconds" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audio_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
--> statement-breakpoint
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"score" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ratings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "script_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"file_size" integer,
	"page_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "script_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"logline" text,
	"synopsis" text,
	"genre" text,
	"age_rating" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"author_id" uuid NOT NULL,
	"banner_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "scripts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "audio_files" ADD CONSTRAINT "audio_files_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_files" ADD CONSTRAINT "script_files_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_script_user_unique" ON "ratings" USING btree ("script_id","user_id");--> statement-breakpoint
CREATE POLICY "Users are publicly readable" ON "users" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Audio files are publicly readable" ON "audio_files" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Authors manage their audio files" ON "audio_files" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = (select author_id from scripts where id = script_id)) WITH CHECK (auth.uid() = (select author_id from scripts where id = script_id));--> statement-breakpoint
CREATE POLICY "Comments on published scripts are publicly readable" ON "comments" AS PERMISSIVE FOR SELECT TO public USING (deleted_at is null);--> statement-breakpoint
CREATE POLICY "Authenticated users can create comments" ON "comments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = author_id);--> statement-breakpoint
CREATE POLICY "Authors manage their own comments" ON "comments" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);--> statement-breakpoint
CREATE POLICY "Ratings are publicly readable" ON "ratings" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated users manage their own ratings" ON "ratings" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "Script files follow script visibility" ON "script_files" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Authors manage their script files" ON "script_files" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = (select author_id from scripts where id = script_id)) WITH CHECK (auth.uid() = (select author_id from scripts where id = script_id));--> statement-breakpoint
CREATE POLICY "Published scripts are publicly readable" ON "scripts" AS PERMISSIVE FOR SELECT TO public USING (status = 'published');--> statement-breakpoint
CREATE POLICY "Authors manage their own scripts" ON "scripts" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);