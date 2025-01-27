import { buses, busSeats, busTypeEnum, maintenanceStatusEnum, seatTierEnum } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import type { CompanyResponse } from "./company.types";

/**
 * Database model types
 */
export type Bus = InferSelectModel<typeof buses> & {
  company?: CompanyResponse;
};
export type BusSeat = InferSelectModel<typeof busSeats>;

/**
 * Base schema for bus forms
 */
const baseBusFormSchema = z.object({
  plateNumber: z.string().trim().min(1, "La placa es requerida"),
  busType: z.enum(busTypeEnum.enumValues),
  totalCapacity: z.coerce.number().min(1, "La capacidad debe ser mayor a 0"),
  maintenanceStatus: z.enum(maintenanceStatusEnum.enumValues).default("active"),
  companyId: z.string().uuid("ID de empresa inválido"),
});

/**
 * Form schemas
 */
export const createBusFormSchema = baseBusFormSchema;
export const editBusFormSchema = baseBusFormSchema;

/**
 * Form data types
 */
export type CreateBusFormData = z.infer<typeof createBusFormSchema>;
export type EditBusFormData = z.infer<typeof editBusFormSchema>;

/**
 * API schemas
 */
export const insertBusSchema = z.object({
  companyId: z.string().uuid(),
  plateNumber: z.string().trim().min(1),
  busType: z.enum(busTypeEnum.enumValues),
  totalCapacity: z.coerce.number().min(1),
  maintenanceStatus: z.enum(maintenanceStatusEnum.enumValues).default("active"),
});

export const updateBusSchema = insertBusSchema.partial().extend({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
});

export type CreateBusInput = z.infer<typeof insertBusSchema>;
export type UpdateBusInput = z.infer<typeof updateBusSchema>;

/**
 * Helper type for labeling bus types
 */
export type BusTypeLabel = {
  [K in typeof busTypeEnum.enumValues[number]]: string;
};

/**
 * Helper type for labeling maintenance status
 */
export type MaintenanceStatusLabel = {
  [K in typeof maintenanceStatusEnum.enumValues[number]]: string;
};

// Seat related schemas remain unchanged
const baseBusSeatSchema = z.object({
  busId: z.string().uuid(),
  seatNumber: z.string().trim().min(1),
  tier: z.enum(seatTierEnum.enumValues),
  deck: z.number().default(1),
});

export const createSeatFormSchema = baseBusSeatSchema;
export const updateSeatFormSchema = baseBusSeatSchema
  .partial()
  .extend({ id: z.string().uuid() });

export type CreateBusSeatInput = z.infer<typeof createSeatFormSchema>;
export type UpdateBusSeatInput = z.infer<typeof updateSeatFormSchema>;