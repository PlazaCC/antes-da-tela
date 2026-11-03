CREATE INDEX "comments_script_page_idx" ON "comments" USING btree ("script_id","page_number") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "scripts_author_idx" ON "scripts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "scripts_status_published_at_idx" ON "scripts" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "user_follows_followee_idx" ON "user_follows" USING btree ("followee_id");