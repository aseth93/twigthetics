create table if not exists "member_workout_schedule_entries" (
  "id" uuid primary key default gen_random_uuid(),
  "member_id" uuid not null references "users"("id") on delete cascade,
  "scheduled_date" date not null,
  "title" varchar(200) not null,
  "day_type" varchar(64) not null default 'training',
  "summary" text,
  "details" text,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now()
);
--> statement-breakpoint
create unique index if not exists "uniq_member_workout_schedule_member_date"
  on "member_workout_schedule_entries" ("member_id", "scheduled_date");
--> statement-breakpoint
create index if not exists "idx_member_workout_schedule_member_date"
  on "member_workout_schedule_entries" ("member_id", "scheduled_date");
