CREATE TYPE "public"."activity_type" AS ENUM('archived', 'completed', 'created', 'deleted', 'generic', 'launched', 'respondes_recorded', 'settings_updated', 'status_changed', 'tested', 'updated');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('female', 'male', 'other', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."survey_status" AS ENUM('draft', 'testing', 'active', 'complete', 'archived');--> statement-breakpoint
CREATE TABLE "account" (
	"access_token" text,
	"access_token_expires_at" timestamp,
	"account_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"id_token" text,
	"password" text,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"updated_at" timestamp NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"details" jsonb,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metadata" jsonb,
	"survey_id" uuid,
	"tenant_id" uuid NOT NULL,
	"text" text,
	"type" "activity_type" NOT NULL,
	"user_id" text
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"response_id" uuid NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"value" jsonb,
	"was_skipped" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authenticity_scores" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_overridden" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"override_original_percentage" integer,
	"override_reason" text,
	"override_user_id" text,
	"override_timestamp" timestamp,
	"percentage" integer NOT NULL,
	"response_id" uuid NOT NULL,
	"survey_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"allow_other" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metadata" jsonb,
	"options" jsonb,
	"order" integer DEFAULT 0 NOT NULL,
	"randomise_order" boolean DEFAULT false NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"survey_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"type" varchar(50) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"validations" jsonb DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE "respondents" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"gender" "gender",
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_city" text,
	"location_country" text,
	"metadata" jsonb,
	"name" text NOT NULL,
	"notes" text,
	"signup_source" text,
	"tenant_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"geolocation" jsonb,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metadata" jsonb,
	"respondent_id" uuid,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"survey_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"was_completed" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"ip_address" text,
	"token" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "survey_settings" (
	"allow_anonymous" boolean DEFAULT true NOT NULL,
	"close_on_response_limit" boolean DEFAULT false NOT NULL,
	"closed_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_password_protected" boolean DEFAULT false NOT NULL,
	"max_responses" integer,
	"password" text,
	"survey_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"archived_at" timestamp,
	"campaign_id" uuid NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"has_responses" boolean DEFAULT false NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launched_at" timestamp,
	"settings" jsonb,
	"slug" varchar(255) NOT NULL,
	"status" "survey_status" DEFAULT 'draft' NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tested_at" timestamp,
	"title" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "surveys_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"created_at" timestamp NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
	"name" text NOT NULL,
	"tenant_id" uuid,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"created_at" timestamp,
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"identifier" text NOT NULL,
	"updated_at" timestamp,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_response_id_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticity_scores" ADD CONSTRAINT "authenticity_scores_override_user_id_user_id_fk" FOREIGN KEY ("override_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticity_scores" ADD CONSTRAINT "authenticity_scores_response_id_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticity_scores" ADD CONSTRAINT "authenticity_scores_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respondents" ADD CONSTRAINT "respondents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_respondent_id_respondents_id_fk" FOREIGN KEY ("respondent_id") REFERENCES "public"."respondents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_settings" ADD CONSTRAINT "survey_settings_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_created_at_idx" ON "activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_survey_idx" ON "activities" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "activity_tenant_idx" ON "activities" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "activity_type_idx" ON "activities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "activity_user_idx" ON "activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "answer_question_idx" ON "answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "answer_response_idx" ON "answers" USING btree ("response_id");--> statement-breakpoint
CREATE INDEX "authenticity_response_idx" ON "authenticity_scores" USING btree ("response_id");--> statement-breakpoint
CREATE INDEX "authenticity_survey_idx" ON "authenticity_scores" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "survey_idx" ON "questions" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "type_idx" ON "questions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "respondent_email_tenant_idx" ON "respondents" USING btree ("email","tenant_id");--> statement-breakpoint
CREATE INDEX "respondent_signup_source_idx" ON "respondents" USING btree ("signup_source");--> statement-breakpoint
CREATE INDEX "respondent_tenant_idx" ON "respondents" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "response_respondent_idx" ON "responses" USING btree ("respondent_id");--> statement-breakpoint
CREATE INDEX "response_survey_idx" ON "responses" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "response_survey_tenant_idx" ON "responses" USING btree ("survey_id","tenant_id");--> statement-breakpoint
CREATE INDEX "response_tenant_idx" ON "responses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "campaign_idx" ON "surveys" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "slug_idx" ON "surveys" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "status_idx" ON "surveys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tenant_idx" ON "surveys" USING btree ("tenant_id");