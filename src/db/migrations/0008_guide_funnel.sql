CREATE TABLE IF NOT EXISTS "guide_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"status" varchar(32) DEFAULT 'preview_only' NOT NULL,
	"unsubscribe_token" varchar(120) NOT NULL,
	"preview_delivered_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"sequence_email_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attribution" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_guide_leads_email" ON "guide_leads" USING btree ("email");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_guide_leads_unsubscribe_token" ON "guide_leads" USING btree ("unsubscribe_token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_guide_leads_created_at" ON "guide_leads" USING btree ("created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guide_funnel_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" varchar(64) NOT NULL,
	"visitor_id" varchar(120),
	"lead_id" uuid,
	"email" varchar(255),
	"stripe_checkout_session_id" varchar(255),
	"path" text,
	"attribution" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guide_funnel_events" ADD CONSTRAINT "guide_funnel_events_lead_id_guide_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."guide_leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_guide_funnel_event_name" ON "guide_funnel_events" USING btree ("event_name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_guide_funnel_created_at" ON "guide_funnel_events" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_guide_funnel_visitor_id" ON "guide_funnel_events" USING btree ("visitor_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_guide_funnel_session_id" ON "guide_funnel_events" USING btree ("stripe_checkout_session_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guide_testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid,
	"email" varchar(255),
	"display_name" varchar(120) NOT NULL,
	"quote" text NOT NULL,
	"rating" integer,
	"source" varchar(40) DEFAULT 'customer' NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guide_testimonials" ADD CONSTRAINT "guide_testimonials_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_guide_testimonials_status" ON "guide_testimonials" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_guide_testimonials_created_at" ON "guide_testimonials" USING btree ("created_at");
