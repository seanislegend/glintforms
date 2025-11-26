CREATE TABLE "analysis_theme_entries" (
	"theme_id" uuid NOT NULL,
	"answer_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analysis_themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"question_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sentiment" varchar(50),
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "analysis_theme_entries" ADD CONSTRAINT "analysis_theme_entries_theme_id_analysis_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."analysis_themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_theme_entries" ADD CONSTRAINT "analysis_theme_entries_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_themes" ADD CONSTRAINT "analysis_themes_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entry_theme_idx" ON "analysis_theme_entries" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "entry_answer_idx" ON "analysis_theme_entries" USING btree ("answer_id");--> statement-breakpoint
CREATE INDEX "analysis_theme_question_idx" ON "analysis_themes" USING btree ("question_id");