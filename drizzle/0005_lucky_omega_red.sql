CREATE TYPE "public"."schedule_status_enum" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "route_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"departure_time" time NOT NULL,
	"operating_days" text[] NOT NULL,
	"active" boolean DEFAULT true,
	"season_start" date,
	"season_end" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "status" SET DATA TYPE schedule_status_enum;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "route_schedule_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "estimated_arrival_time" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "actual_departure_time" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "actual_arrival_time" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "route_schedules" ADD CONSTRAINT "route_schedules_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_route_schedule_id_route_schedules_id_fk" FOREIGN KEY ("route_schedule_id") REFERENCES "public"."route_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" DROP COLUMN "departure_time";--> statement-breakpoint
ALTER TABLE "routes" DROP COLUMN "arrival_time";--> statement-breakpoint
ALTER TABLE "routes" DROP COLUMN "operating_days";