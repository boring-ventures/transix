-- CreateEnum
CREATE TYPE "public"."bus_assignment_status_enum" AS ENUM ('active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."event_type_enum" AS ENUM ('arrival', 'departure');

-- CreateEnum
CREATE TYPE "public"."incident_type_enum" AS ENUM ('complaint', 'delay', 'accident');

-- CreateEnum
CREATE TYPE "public"."maintenance_status_enum" AS ENUM ('active', 'in_maintenance', 'retired');

-- CreateEnum
CREATE TYPE "public"."parcel_status_enum" AS ENUM ('received', 'in_transit', 'ready_for_pickup', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."payment_method_enum" AS ENUM ('cash', 'card', 'bank_transfer', 'qr');

-- CreateEnum
CREATE TYPE "public"."role_enum" AS ENUM ('superadmin', 'company_admin', 'branch_admin', 'seller');

-- CreateEnum
CREATE TYPE "public"."schedule_status_enum" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed');

-- CreateEnum
CREATE TYPE "public"."seat_status_enum" AS ENUM ('available', 'maintenance');

-- CreateEnum
CREATE TYPE "public"."ticket_status_enum" AS ENUM ('active', 'cancelled');

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company_id" UUID,
    "full_name" TEXT,
    "role" "public"."role_enum" NOT NULL,
    "branch_id" UUID,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."branches" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bus_assignments" (
    "id" UUID NOT NULL,
    "bus_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "status" "public"."bus_assignment_status_enum" DEFAULT 'active',
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bus_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bus_logs" (
    "id" UUID NOT NULL,
    "schedule_id" UUID,
    "event_type" "public"."event_type_enum" NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location_id" UUID,
    "logged_by" UUID,

    CONSTRAINT "bus_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bus_seats" (
    "id" UUID NOT NULL,
    "bus_id" UUID,
    "seat_number" TEXT NOT NULL,
    "tier_id" UUID NOT NULL,
    "status" "public"."seat_status_enum" DEFAULT 'available',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bus_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bus_type_templates" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "total_capacity" INTEGER NOT NULL,
    "seat_template_matrix" JSONB NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "seats_layout" TEXT NOT NULL,

    CONSTRAINT "bus_type_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."buses" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "plate_number" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "seat_matrix" JSONB NOT NULL,
    "maintenance_status_enum" "public"."maintenance_status_enum" DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "document_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."incidents" (
    "id" UUID NOT NULL,
    "type" "public"."incident_type_enum" NOT NULL,
    "description" TEXT NOT NULL,
    "reported_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reported_by" UUID,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" UUID NOT NULL,
    "payment_id" UUID,
    "invoice_number" TEXT NOT NULL,
    "tax_info" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."occupancy_logs" (
    "id" UUID NOT NULL,
    "schedule_id" UUID,
    "occupied_seats" INTEGER NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "occupancy_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parcel_status_updates" (
    "id" UUID NOT NULL,
    "parcel_id" UUID,
    "status" "public"."parcel_status_enum" NOT NULL,
    "updated_by" UUID,
    "reason" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parcel_status_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parcels" (
    "id" UUID NOT NULL,
    "schedule_id" UUID,
    "sender_id" UUID,
    "receiver_id" UUID,
    "weight" DECIMAL NOT NULL,
    "dimensions" JSONB,
    "declared_value" DECIMAL NOT NULL,
    "status" "public"."parcel_status_enum" DEFAULT 'received',
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parcels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_lines" (
    "id" UUID NOT NULL,
    "payment_id" UUID,
    "ticket_id" UUID,
    "parcel_id" UUID,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "public"."payment_method_enum" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."route_schedules" (
    "id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "departure_time" TIME(6) NOT NULL,
    "operating_days" TEXT[],
    "active" BOOLEAN DEFAULT true,
    "season_start" DATE,
    "season_end" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."routes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "origin_id" UUID NOT NULL,
    "destination_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimated_duration" INTEGER NOT NULL,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedules" (
    "id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "route_schedule_id" UUID NOT NULL,
    "bus_id" UUID,
    "departure_date" DATE NOT NULL,
    "estimated_arrival_time" TIMESTAMPTZ(6) NOT NULL,
    "actual_departure_time" TIMESTAMPTZ(6),
    "actual_arrival_time" TIMESTAMPTZ(6),
    "price" INTEGER NOT NULL,
    "status" "public"."schedule_status_enum" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seat_tiers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seat_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ticket_cancellations" (
    "id" UUID NOT NULL,
    "ticket_id" UUID,
    "reason" TEXT NOT NULL,
    "cancelled_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ticket_reassignments" (
    "id" UUID NOT NULL,
    "ticket_id" UUID,
    "old_schedule_id" UUID,
    "new_schedule_id" UUID,
    "reason" TEXT NOT NULL,
    "reassigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_reassignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tickets" (
    "id" UUID NOT NULL,
    "schedule_id" UUID,
    "customer_id" UUID,
    "bus_seat_id" UUID NOT NULL,
    "status" "public"."ticket_status_enum" DEFAULT 'active',
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchased_by" UUID,
    "notes" TEXT,
    "purchased_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buses_plate_number_unique" ON "public"."buses"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "customers_document_id_unique" ON "public"."customers"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_unique" ON "public"."invoices"("invoice_number");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."branches" ADD CONSTRAINT "branches_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bus_assignments" ADD CONSTRAINT "bus_assignments_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bus_assignments" ADD CONSTRAINT "bus_assignments_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bus_assignments" ADD CONSTRAINT "bus_assignments_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bus_logs" ADD CONSTRAINT "bus_logs_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bus_logs" ADD CONSTRAINT "bus_logs_logged_by_profiles_id_fk" FOREIGN KEY ("logged_by") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bus_logs" ADD CONSTRAINT "bus_logs_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bus_seats" ADD CONSTRAINT "bus_seats_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bus_seats" ADD CONSTRAINT "bus_seats_tier_id_seat_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."seat_tiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."bus_type_templates" ADD CONSTRAINT "bus_type_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."buses" ADD CONSTRAINT "buses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."buses" ADD CONSTRAINT "buses_template_id_bus_type_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."bus_type_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_reported_by_profiles_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."occupancy_logs" ADD CONSTRAINT "occupancy_logs_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."parcel_status_updates" ADD CONSTRAINT "parcel_status_updates_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."parcel_status_updates" ADD CONSTRAINT "parcel_status_updates_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."parcels" ADD CONSTRAINT "parcels_receiver_id_customers_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."parcels" ADD CONSTRAINT "parcels_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."parcels" ADD CONSTRAINT "parcels_sender_id_customers_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."payment_lines" ADD CONSTRAINT "payment_lines_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."payment_lines" ADD CONSTRAINT "payment_lines_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."payment_lines" ADD CONSTRAINT "payment_lines_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."route_schedules" ADD CONSTRAINT "route_schedules_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."routes" ADD CONSTRAINT "routes_destination_id_locations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."routes" ADD CONSTRAINT "routes_origin_id_locations_id_fk" FOREIGN KEY ("origin_id") REFERENCES "public"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_route_schedule_id_route_schedules_id_fk" FOREIGN KEY ("route_schedule_id") REFERENCES "public"."route_schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."seat_tiers" ADD CONSTRAINT "seat_tiers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ticket_cancellations" ADD CONSTRAINT "ticket_cancellations_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ticket_reassignments" ADD CONSTRAINT "ticket_reassignments_new_schedule_id_schedules_id_fk" FOREIGN KEY ("new_schedule_id") REFERENCES "public"."schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ticket_reassignments" ADD CONSTRAINT "ticket_reassignments_old_schedule_id_schedules_id_fk" FOREIGN KEY ("old_schedule_id") REFERENCES "public"."schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ticket_reassignments" ADD CONSTRAINT "ticket_reassignments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_bus_seat_id_bus_seats_id_fk" FOREIGN KEY ("bus_seat_id") REFERENCES "public"."bus_seats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_purchased_by_profiles_id_fk" FOREIGN KEY ("purchased_by") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
