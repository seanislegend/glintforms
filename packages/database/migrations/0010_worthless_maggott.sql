CREATE TYPE "public"."screener_type" AS ENUM('age', 'location', 'single_choice');--> statement-breakpoint
CREATE TABLE "screeners" (
	"config" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"tenant_id" uuid NOT NULL,
	"type" "screener_type" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_screeners" (
	"failure_message" text,
	"order" integer DEFAULT 0 NOT NULL,
	"screener_id" uuid NOT NULL,
	"survey_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "screeners" ADD CONSTRAINT "screeners_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_screeners" ADD CONSTRAINT "survey_screeners_screener_id_screeners_id_fk" FOREIGN KEY ("screener_id") REFERENCES "public"."screeners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_screeners" ADD CONSTRAINT "survey_screeners_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "screener_tenant_idx" ON "screeners" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "survey_screener_screener_idx" ON "survey_screeners" USING btree ("screener_id");--> statement-breakpoint
CREATE INDEX "survey_screener_survey_idx" ON "survey_screeners" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "survey_screener_pk" ON "survey_screeners" USING btree ("survey_id","screener_id");