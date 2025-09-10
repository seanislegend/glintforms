CREATE TABLE "cohorts" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"tenant_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "respondent_cohorts" (
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" text,
	"cohort_id" uuid NOT NULL,
	"respondent_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respondent_cohorts" ADD CONSTRAINT "respondent_cohorts_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respondent_cohorts" ADD CONSTRAINT "respondent_cohorts_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respondent_cohorts" ADD CONSTRAINT "respondent_cohorts_respondent_id_respondents_id_fk" FOREIGN KEY ("respondent_id") REFERENCES "public"."respondents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cohort_tenant_idx" ON "cohorts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "respondent_cohort_cohort_idx" ON "respondent_cohorts" USING btree ("cohort_id");--> statement-breakpoint
CREATE INDEX "respondent_cohort_respondent_idx" ON "respondent_cohorts" USING btree ("respondent_id");--> statement-breakpoint
CREATE INDEX "respondent_cohort_pk" ON "respondent_cohorts" USING btree ("respondent_id","cohort_id");