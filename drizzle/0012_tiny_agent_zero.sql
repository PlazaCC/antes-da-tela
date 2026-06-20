DROP INDEX IF EXISTS "audio_files_script_id_unique";--> statement-breakpoint
ALTER TABLE "audio_files" ADD COLUMN "title" text DEFAULT 'Roteiro falado' NOT NULL;--> statement-breakpoint
ALTER TABLE "audio_files" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "audio_files" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "scripts" ADD COLUMN "subgenres" text[];--> statement-breakpoint
ALTER TABLE "scripts" ADD COLUMN "bn_registration" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cpf" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_cpf_unique" UNIQUE("cpf");