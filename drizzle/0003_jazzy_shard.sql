CREATE TYPE "public"."bus_assignment_status_enum" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "bus_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bus_id" uuid NOT NULL,
	"route_id" uuid NOT NULL,
	"schedule_id" uuid NOT NULL,
	"status" "bus_assignment_status_enum" DEFAULT 'active',
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "departure_time" time NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "arrival_time" time NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "operating_days" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "bus_assignments" ADD CONSTRAINT "bus_assignments_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bus_assignments" ADD CONSTRAINT "bus_assignments_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bus_assignments" ADD CONSTRAINT "bus_assignments_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE no action ON UPDATE no action;