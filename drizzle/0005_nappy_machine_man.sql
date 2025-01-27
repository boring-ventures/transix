CREATE TYPE "public"."maintenance_status" AS ENUM('active', 'in_maintenance', 'retired');--> statement-breakpoint
ALTER TABLE "buses" ALTER COLUMN "maintenance_status" SET DATA TYPE maintenance_status;--> statement-breakpoint
ALTER TABLE "buses" ALTER COLUMN "maintenance_status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "auth"."users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();