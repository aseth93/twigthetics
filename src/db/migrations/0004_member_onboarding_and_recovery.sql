ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "member_onboarding_seen_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "daily_checkins"
ADD COLUMN IF NOT EXISTS "hydration_ounces" integer;
--> statement-breakpoint
ALTER TABLE "daily_checkins"
ADD COLUMN IF NOT EXISTS "sleep_tenths" integer;
