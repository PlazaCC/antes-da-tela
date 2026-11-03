-- Reading requires an account: signed-out visitors (role anon) can still see a
-- script's page (title, cover, synopsis, page count) but cannot get the
-- storage keys of its PDF, audio tracks or pitch deck. Column privileges, same
-- approach as 0014: anon may SELECT every column except those keys.
-- A column added to these tables later is NOT readable by anon until granted here.
REVOKE SELECT ON TABLE "public"."script_files" FROM anon;--> statement-breakpoint
GRANT SELECT ("id", "script_id", "file_size", "page_count", "created_at") ON TABLE "public"."script_files" TO anon;--> statement-breakpoint

REVOKE SELECT ON TABLE "public"."audio_files" FROM anon;--> statement-breakpoint
GRANT SELECT ("id", "script_id", "title", "description", "sort_order", "duration_seconds", "created_at") ON TABLE "public"."audio_files" TO anon;--> statement-breakpoint

REVOKE SELECT ON TABLE "public"."scripts" FROM anon;--> statement-breakpoint
GRANT SELECT ("id", "title", "logline", "synopsis", "genre", "subgenres", "age_rating", "bn_registration", "is_featured", "status", "author_id", "banner_path", "cover_path", "created_at", "published_at") ON TABLE "public"."scripts" TO anon;
