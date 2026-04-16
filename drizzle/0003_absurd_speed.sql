CREATE TYPE "public"."script_status" AS ENUM('draft', 'published');
ALTER TABLE "scripts" ALTER COLUMN "status" SET DEFAULT 'published'::"public"."script_status";
ALTER TABLE "scripts" ALTER COLUMN "status" SET DATA TYPE "public"."script_status" USING "status"::"public"."script_status";
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_score_range" CHECK ("ratings"."score" >= 1 AND "ratings"."score" <= 5);
