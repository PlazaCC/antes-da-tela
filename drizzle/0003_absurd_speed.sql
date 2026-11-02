CREATE TYPE "public"."script_status" AS ENUM('draft', 'published');
-- The column type cannot change while a policy depends on it: drop and
-- recreate the 0002 policy around the change (needed on a fresh database).
DROP POLICY IF EXISTS "Published scripts are publicly readable" ON "scripts";
ALTER TABLE "scripts" ALTER COLUMN "status" SET DEFAULT 'published'::"public"."script_status";
ALTER TABLE "scripts" ALTER COLUMN "status" SET DATA TYPE "public"."script_status" USING "status"::"public"."script_status";
CREATE POLICY "Published scripts are publicly readable" ON "scripts" AS PERMISSIVE FOR SELECT TO public USING (status = 'published');
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_score_range" CHECK ("ratings"."score" >= 1 AND "ratings"."score" <= 5);
