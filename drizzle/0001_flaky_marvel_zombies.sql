ALTER TABLE "bus_type_templates" RENAME COLUMN "seat_matrix" TO "seat_template_matrix";--> statement-breakpoint
ALTER TABLE "buses" ADD COLUMN "seat_matrix" jsonb NOT NULL;