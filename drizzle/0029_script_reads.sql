CREATE TABLE "script_reads" (
	"script_id" uuid NOT NULL,
	"reader_id" uuid NOT NULL,
	"pages_total" integer NOT NULL,
	"max_page" integer NOT NULL,
	"first_read_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "script_reads_script_id_reader_id_pk" PRIMARY KEY("script_id","reader_id"),
	CONSTRAINT "script_reads_pages_range" CHECK ("script_reads"."max_page" >= 1 AND "script_reads"."max_page" <= "script_reads"."pages_total")
);
--> statement-breakpoint
ALTER TABLE "script_reads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "script_reads" ADD CONSTRAINT "script_reads_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_reads" ADD CONSTRAINT "script_reads_reader_id_users_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Readers see their own reads" ON "script_reads" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.current_user_id()) = reader_id);