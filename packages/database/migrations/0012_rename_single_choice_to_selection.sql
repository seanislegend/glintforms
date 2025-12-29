-- convert column to text to allow data updates
ALTER TABLE "screeners" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
-- update existing 'single_choice' values to 'selection'
UPDATE "screeners" SET "type" = 'selection' WHERE "type" = 'single_choice';--> statement-breakpoint
-- drop old enum type
DROP TYPE "public"."screener_type";--> statement-breakpoint
-- create new enum type with 'selection' instead of 'single_choice'
CREATE TYPE "public"."screener_type" AS ENUM('age', 'location', 'selection');--> statement-breakpoint
-- convert column back to enum type
ALTER TABLE "screeners" ALTER COLUMN "type" SET DATA TYPE "public"."screener_type" USING "type"::"public"."screener_type";

