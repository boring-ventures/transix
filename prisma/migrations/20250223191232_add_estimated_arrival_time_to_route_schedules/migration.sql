/*
  Warnings:

  - Added the required column `estimated_arrival_time` to the `route_schedules` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."passenger_status_enum" AS ENUM ('confirmed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "public"."settlement_status_enum" AS ENUM ('pending', 'settled');

-- AlterTable
BEGIN;
ALTER TABLE "public"."route_schedules" ADD COLUMN "estimated_arrival_time" TIME(6);
UPDATE "public"."route_schedules" SET "estimated_arrival_time" = (departure_time + INTERVAL '2 hours');
ALTER TABLE "public"."route_schedules" ALTER COLUMN "estimated_arrival_time" SET NOT NULL;
COMMIT;

-- CreateTable
CREATE TABLE "public"."passenger_lists" (
    "id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "document_id" TEXT,
    "full_name" TEXT NOT NULL,
    "seat_number" TEXT NOT NULL,
    "status" "public"."passenger_status_enum" NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passenger_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trip_settlements" (
    "id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "total_income" DECIMAL(10,2) NOT NULL,
    "total_expenses" DECIMAL(10,2) NOT NULL,
    "net_amount" DECIMAL(10,2) NOT NULL,
    "status" "public"."settlement_status_enum" NOT NULL DEFAULT 'pending',
    "details" JSONB NOT NULL,
    "settled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_settlements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."passenger_lists" ADD CONSTRAINT "passenger_lists_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."trip_settlements" ADD CONSTRAINT "trip_settlements_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
