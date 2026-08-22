CREATE TABLE IF NOT EXISTS "guide_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid,
	"stripe_checkout_session_id" varchar(255) NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"customer_name" varchar(255),
	"guide_id" varchar(120) NOT NULL,
	"guide_version" varchar(32) NOT NULL,
	"amount_total" integer NOT NULL,
	"currency" varchar(12) DEFAULT 'usd' NOT NULL,
	"payment_status" varchar(64) NOT NULL,
	"access_status" varchar(32) DEFAULT 'active' NOT NULL,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guide_purchases_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guide_purchases" ADD CONSTRAINT "guide_purchases_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_guide_purchases_member" ON "guide_purchases" USING btree ("member_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_guide_purchases_email" ON "guide_purchases" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_guide_purchases_access" ON "guide_purchases" USING btree ("access_status");
