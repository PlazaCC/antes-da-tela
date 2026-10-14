CREATE TYPE "public"."document_type" AS ENUM('cpf', 'passport', 'crnm', 'foreign_national_id');--> statement-breakpoint
CREATE TABLE "user_documents" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"type" "document_type" NOT NULL,
	"number" text NOT NULL,
	"country" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_documents_type_country_number_unique" ON "user_documents" USING btree ("type","country","number");--> statement-breakpoint
CREATE POLICY "Owners manage their own document" ON "user_documents" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select public.current_user_id()) = user_id) WITH CHECK ((select public.current_user_id()) = user_id);--> statement-breakpoint

-- Private table: nothing for anon; the owner policy above scopes authenticated.
REVOKE ALL ON TABLE "public"."user_documents" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."user_documents" TO authenticated;--> statement-breakpoint

-- Backfill (expand): every CPF already on a profile becomes a document.
-- users.cpf stays until the contract migration drops it.
INSERT INTO "public"."user_documents" ("user_id", "type", "number", "country")
SELECT "id", 'cpf', "cpf", 'BR' FROM "public"."users" WHERE "cpf" IS NOT NULL
ON CONFLICT DO NOTHING;
