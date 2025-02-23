-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "public"."passenger_status_enum" AS ENUM ('confirmed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "public"."settlement_status_enum" AS ENUM ('pending', 'settled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS "public"."passenger_lists" (
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
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- CreateTable
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS "public"."trip_settlements" (
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
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "public"."passenger_lists" 
    ADD CONSTRAINT "passenger_lists_schedule_id_fkey" 
    FOREIGN KEY ("schedule_id") 
    REFERENCES "public"."route_schedules"("id") 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "public"."trip_settlements" 
    ADD CONSTRAINT "trip_settlements_schedule_id_fkey" 
    FOREIGN KEY ("schedule_id") 
    REFERENCES "public"."route_schedules"("id") 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 