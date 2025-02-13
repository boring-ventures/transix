ALTER TABLE "routes" DROP CONSTRAINT "routes_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "routes" DROP CONSTRAINT "routes_default_bus_id_buses_id_fk";
--> statement-breakpoint
ALTER TABLE "buses" ALTER COLUMN "company_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ALTER COLUMN "origin_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ALTER COLUMN "destination_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "route_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "bus_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "price" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "routes" DROP COLUMN "company_id";--> statement-breakpoint
ALTER TABLE "routes" DROP COLUMN "default_bus_id";--> statement-breakpoint
ALTER TABLE "routes" DROP COLUMN "capacity";--> statement-breakpoint
ALTER TABLE "routes" DROP COLUMN "seats_taken";--> statement-breakpoint
ALTER TABLE "schedules" DROP COLUMN "departure_time";--> statement-breakpoint
ALTER TABLE "schedules" DROP COLUMN "arrival_time";--> statement-breakpoint
ALTER TABLE "schedules" DROP COLUMN "capacity";--> statement-breakpoint
ALTER TABLE "schedules" DROP COLUMN "available_seats";