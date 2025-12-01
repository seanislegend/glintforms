CREATE TABLE "response_submissions" (
	"body" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processed_at" timestamp,
	"survey_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "response_submissions" ADD CONSTRAINT "response_submissions_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_submissions" ADD CONSTRAINT "response_submissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "response_submission_processed_at_idx" ON "response_submissions" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "response_submission_survey_idx" ON "response_submissions" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "response_submission_survey_tenant_idx" ON "response_submissions" USING btree ("survey_id","tenant_id");--> statement-breakpoint
CREATE INDEX "response_submission_tenant_idx" ON "response_submissions" USING btree ("tenant_id");