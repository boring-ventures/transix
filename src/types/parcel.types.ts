import { z } from "zod";
import { parcel_status_enum } from "@prisma/client";
import { Schedule } from "./route.types";
import { Profile } from "./user.types";

/**
 * Base Types
 */
export type Parcel = {
  id: string;
  scheduleId: string | null;
  senderId: string | null;
  receiverId: string | null;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  } | null;
  declaredValue: number;
  status: parcel_status_enum;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ParcelStatusUpdate = {
  id: string;
  parcelId: string | null;
  status: parcel_status_enum;
  updatedBy: string | null;
  reason: string | null;
  updatedAt: Date;
};

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
  scheduleId: z.string().uuid("ID de horario inválido").nullable(),
  senderId: z.string().uuid("ID de remitente inválido").nullable(),
  receiverId: z.string().uuid("ID de destinatario inválido").nullable(),
  weight: z.number().min(0, "El peso debe ser mayor o igual a 0"),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }).nullable(),
  declaredValue: z.number().min(0, "El valor declarado debe ser mayor o igual a 0"),
  status: z.nativeEnum(parcel_status_enum).default(parcel_status_enum.received),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
});

export const createParcelSchema = parcelSchema;
export const updateParcelSchema = parcelSchema.partial();

/**
 * Parcel Status Update Schemas
 */
const parcelStatusUpdateSchema = z.object({
  parcelId: z.string().uuid("ID de encomienda inválido").nullable(),
  status: z.nativeEnum(parcel_status_enum),
  updatedBy: z.string().uuid("ID de usuario inválido").nullable(),
  reason: z.string().nullable(),
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
  [K in parcel_status_enum]: string;
}; 
