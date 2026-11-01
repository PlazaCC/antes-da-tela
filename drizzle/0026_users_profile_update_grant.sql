-- Fix for databases that ran 0021 before it granted UPDATE on the new profile
-- columns (users UPDATE is granted per column since 0018). Idempotent: on a
-- fresh database 0021 already granted it.
GRANT UPDATE ("display_name", "pronouns", "location", "links") ON TABLE "public"."users" TO authenticated;
