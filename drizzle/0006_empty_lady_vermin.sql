ALTER TYPE "public"."schedule_status_enum" ADD VALUE 'delayed';--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "purchased_by" uuid;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "purchased_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_purchased_by_profiles_id_fk" FOREIGN KEY ("purchased_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_document_id_unique" UNIQUE("document_id");