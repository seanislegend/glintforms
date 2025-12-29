CREATE TABLE "metrics" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"entity_id" uuid,
	"entity_type" varchar(50),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metadata" jsonb,
	"metric_type" varchar(50) NOT NULL,
	"survey_id" uuid,
	"tenant_id" uuid NOT NULL,
	"value" integer
);
--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "metric_entity_idx" ON "metrics" USING btree ("entity_id","entity_type");--> statement-breakpoint
CREATE INDEX "metric_survey_metric_type_idx" ON "metrics" USING btree ("survey_id","metric_type","created_at");--> statement-breakpoint
CREATE INDEX "metric_survey_metric_type_simple_idx" ON "metrics" USING btree ("survey_id","metric_type");--> statement-breakpoint
CREATE INDEX "metric_tenant_idx" ON "metrics" USING btree ("tenant_id");