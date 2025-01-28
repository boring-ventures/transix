import { parcels, parcelStatusEnum, parcelStatusUpdates } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import { Schedule } from "./route.types";
import { Profile } from "./user.types";

/**
 * Database model types
 */
export type Parcel = InferSelectModel<typeof parcels>;
export type ParcelStatusUpdate = InferSelectModel<typeof parcelStatusUpdates>;

export type ParcelWithRelations = Parcel & {
  schedule?: Schedule;
  sender?: Profile;
  receiver?: Profile;
  statusUpdates?: ParcelStatusUpdate[];
};

/**
 * Parcel Schemas
 */
const parcelSchema = z.object({
  scheduleId: z.string().uuid("ID de horario inválido"),
  senderId: z.string().uuid("ID de remitente inválido"),
  receiverId: z.string().uuid("ID de destinatario inválido"),
  weight: z.number().min(0, "El peso debe ser mayor o igual a 0"),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }).optional(),
  declaredValue: z.number().min(0, "El valor declarado debe ser mayor o igual a 0"),
  status: z.enum(parcelStatusEnum.enumValues).default("received"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
});

export const createParcelSchema = parcelSchema;
export const updateParcelSchema = parcelSchema.partial();

/**
 * Parcel Status Update Schemas
 */
const parcelStatusUpdateSchema = z.object({
  parcelId: z.string().uuid("ID de encomienda inválido"),
  status: z.enum(parcelStatusEnum.enumValues),
  updatedBy: z.string().uuid("ID de usuario inválido"),
  reason: z.string().optional(),
});

export const createParcelStatusUpdateSchema = parcelStatusUpdateSchema;
export const updateParcelStatusUpdateSchema = parcelStatusUpdateSchema.partial();

/**
 * Form Types
 */
export type CreateParcelInput = z.infer<typeof createParcelSchema>;
export type UpdateParcelInput = z.infer<typeof updateParcelSchema>;

export type CreateParcelStatusUpdateInput = z.infer<typeof createParcelStatusUpdateSchema>;
export type UpdateParcelStatusUpdateInput = z.infer<typeof updateParcelStatusUpdateSchema>;

/**
 * Helper Types for Labels
 */
export type ParcelStatusLabel = {
  [K in typeof parcelStatusEnum.enumValues[number]]: string;
}; 