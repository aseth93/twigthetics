CREATE TABLE "coaching_application_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"field_name" varchar(120) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(255),
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"file_blob" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coaching_application_attachments" ADD CONSTRAINT "coaching_application_attachments_application_id_coaching_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."coaching_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_coaching_application_attachments_application_id" ON "coaching_application_attachments" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "idx_coaching_application_attachments_field_name" ON "coaching_application_attachments" USING btree ("field_name");