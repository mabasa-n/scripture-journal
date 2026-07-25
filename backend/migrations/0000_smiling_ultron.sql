CREATE TABLE "scripture_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"heading" varchar(255) NOT NULL,
	"scripture_reference" varchar(100) NOT NULL,
	"scripture_text" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scripture_entries_heading_not_empty" CHECK (char_length(btrim("scripture_entries"."heading")) > 0),
	CONSTRAINT "scripture_entries_reference_not_empty" CHECK (char_length(btrim("scripture_entries"."scripture_reference")) > 0),
	CONSTRAINT "scripture_entries_text_not_empty" CHECK (char_length(btrim("scripture_entries"."scripture_text")) > 0),
	CONSTRAINT "scripture_entries_description_not_empty_when_present" CHECK ("scripture_entries"."description" IS NULL OR char_length(btrim("scripture_entries"."description")) > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "scripture_entries" ADD CONSTRAINT "scripture_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_scripture_entries_user_id" ON "scripture_entries" USING btree ("user_id");