CREATE TABLE IF NOT EXISTS "member_plan_updates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "member_id" uuid NOT NULL,
  "plan_assignment_id" uuid,
  "created_by_user_id" uuid,
  "title" varchar(200) NOT NULL,
  "summary" text DEFAULT '' NOT NULL,
  "items" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "seen_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_plan_updates" ADD CONSTRAINT "member_plan_updates_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_plan_updates" ADD CONSTRAINT "member_plan_updates_plan_assignment_id_plan_assignments_id_fk" FOREIGN KEY ("plan_assignment_id") REFERENCES "public"."plan_assignments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_plan_updates" ADD CONSTRAINT "member_plan_updates_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_member_plan_updates_member_seen" ON "member_plan_updates" USING btree ("member_id","seen_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_member_plan_updates_assignment" ON "member_plan_updates" USING btree ("plan_assignment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_member_plan_updates_created_at" ON "member_plan_updates" USING btree ("created_at");
