CREATE TYPE "public"."bus_type_enum" AS ENUM('standard', 'double_decker', 'luxury', 'mini');
CREATE TYPE "public"."seat_tier_enum" AS ENUM('economy', 'business', 'premium');

CREATE TABLE "bus_seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bus_id" uuid,
	"seat_number" text NOT NULL,
	"tier" "seat_tier_enum" NOT NULL,
	"deck" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "buses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"plate_number" text NOT NULL,
	"bus_type" "bus_type_enum" NOT NULL,
	"total_capacity" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"maintenance_status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "buses_plate_number_unique" UNIQUE("plate_number")
);

CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_name_unique" UNIQUE("name")
);

ALTER TABLE "tickets" DROP COLUMN "seat_number";
ALTER TABLE "tickets" ADD COLUMN "bus_seat_id" uuid;

ALTER TABLE "branches" ADD COLUMN "company_id" uuid NOT NULL;
ALTER TABLE "profiles" ADD COLUMN "company_id" uuid;
ALTER TABLE "schedules" ADD COLUMN "bus_id" uuid;

ALTER TABLE "bus_seats" ADD CONSTRAINT "bus_seats_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "buses" ADD CONSTRAINT "buses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "branches" ADD CONSTRAINT "branches_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_bus_seat_id_bus_seats_id_fk" FOREIGN KEY ("bus_seat_id") REFERENCES "public"."bus_seats"("id") ON DELETE no action ON UPDATE no action;