ALTER TABLE "cohorts" DROP CONSTRAINT "cohorts_survey_id_surveys_id_fk";
--> statement-breakpoint
DROP INDEX "cohort_survey_idx";--> statement-breakpoint
DROP INDEX "cohort_type_idx";--> statement-breakpoint
ALTER TABLE "cohorts" DROP COLUMN "survey_id";--> statement-breakpoint
ALTER TABLE "cohorts" DROP COLUMN "time_based_config";--> statement-breakpoint
ALTER TABLE "cohorts" DROP COLUMN "type";--> statement-breakpoint
DROP TYPE "public"."cohort_type";