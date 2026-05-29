ALTER TABLE "documents"
ADD COLUMN IF NOT EXISTS "section" varchar(32) NOT NULL DEFAULT 'misc';
