ALTER TABLE "analysis_theme_entries" ADD COLUMN "question_id" uuid;--> statement-breakpoint
UPDATE "analysis_theme_entries" SET "question_id" = "answers"."question_id" FROM "answers" WHERE "analysis_theme_entries"."answer_id" = "answers"."id";--> statement-breakpoint
ALTER TABLE "analysis_theme_entries" ALTER COLUMN "question_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "analysis_theme_entries" ADD CONSTRAINT "analysis_theme_entries_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entry_question_idx" ON "analysis_theme_entries" USING btree ("question_id");