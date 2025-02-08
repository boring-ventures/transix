ALTER TABLE "routes" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "default_bus_id" uuid;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "estimated_duration" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "arrival_time" time NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "status" text DEFAULT 'scheduled' NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "available_seats" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_default_bus_id_buses_id_fk" FOREIGN KEY ("default_bus_id") REFERENCES "public"."buses"("id") ON DELETE no action ON UPDATE no action;