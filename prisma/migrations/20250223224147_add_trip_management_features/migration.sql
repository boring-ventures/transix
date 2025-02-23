-- AlterTable
ALTER TABLE "public"."routes" ADD COLUMN     "departure_lane" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "public"."schedules" ADD COLUMN     "primary_driver_id" UUID,
ADD COLUMN     "secondary_driver_id" UUID;

-- CreateTable
CREATE TABLE "public"."drivers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "license_category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_primary_driver_id_fkey" FOREIGN KEY ("primary_driver_id") REFERENCES "public"."drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_secondary_driver_id_fkey" FOREIGN KEY ("secondary_driver_id") REFERENCES "public"."drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."drivers" ADD CONSTRAINT "drivers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
