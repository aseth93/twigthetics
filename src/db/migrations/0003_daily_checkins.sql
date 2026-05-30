CREATE TABLE IF NOT EXISTS "daily_checkins" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "member_id" uuid NOT NULL,
  "checkin_date" date NOT NULL,
  "weight_tenths" integer,
  "workout_notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_checkins"
ADD CONSTRAINT "daily_checkins_member_id_users_id_fk"
FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_daily_checkins_member_date"
ON "daily_checkins" USING btree ("member_id","checkin_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_daily_checkins_member_date"
ON "daily_checkins" USING btree ("member_id","checkin_date");
