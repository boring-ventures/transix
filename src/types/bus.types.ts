import { buses, busSeats, busTypeTemplates, maintenanceStatusEnum, seatStatusEnum, seatTiers } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import type { Company } from "./company.types";

/**
 * Database model types
 */
export type Bus = InferSelectModel<typeof buses>;
export type BusSeat = InferSelectModel<typeof busSeats>;
export type BusTypeTemplate = InferSelectModel<typeof busTypeTemplates>;
export type SeatTier = InferSelectModel<typeof seatTiers>;

export type BusWithRelations = Bus & {
  company?: Company;
  template?: BusTypeTemplate;
  seats?: BusSeat[];
};

/**
 * Seat Matrix Types
 */
export type SeatPosition = {
  id: string;
  name: string;
  tierId: string;
  row: number;
  column: number;
  isEmpty: boolean;
};

export type FloorMatrix = {
  dimensions: {
    rows: number;
    seatsPerRow: number;
  };
  seats: SeatPosition[];
};

export type SeatTemplateMatrix = {
  firstFloor: FloorMatrix;
  secondFloor?: FloorMatrix;
};

// Alias for backward compatibility
export type BusSeatMatrix = SeatTemplateMatrix;

/**
 * Bus Type Template Schemas
 */
export const busTypeTemplateSchema = z.object({
  companyId: z.string().uuid("ID de empresa inválido"),
  name: z.string().min(1, "El nombre es requerido").trim(),
  description: z.string().optional(),
  totalCapacity: z.number().min(1, "La capacidad debe ser mayor a 0"),
  seatTemplateMatrix: z.object({
    firstFloor: z.object({
      dimensions: z.object({
        rows: z.number(),
        seatsPerRow: z.number(),
      }),
      seats: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          tierId: z.union([
            z.string().uuid("ID de nivel inválido"),
            z.literal("")
          ]),
          row: z.number(),
          column: z.number(),
          isEmpty: z.boolean().default(false),
        })
      ),
    }),
    secondFloor: z.object({
      dimensions: z.object({
        rows: z.number(),
        seatsPerRow: z.number(),
      }),
      seats: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          tierId: z.union([
            z.string().uuid("ID de nivel inválido"),
            z.literal("")
          ]),
          row: z.number(),
          column: z.number(),
          isEmpty: z.boolean().default(false),
        })
      ),
    }).optional(),
  }),
  isActive: z.boolean().default(true),
});

export const createBusTypeTemplateSchema = busTypeTemplateSchema.superRefine((data, ctx) => {
  // Validate first floor seats have tiers (only for non-empty seats)
  const firstFloorUnassigned = data.seatTemplateMatrix.firstFloor.seats.some(
    seat => !seat.isEmpty && (!seat.tierId || seat.tierId === "")
  );
  if (firstFloorUnassigned) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Todos los asientos activos del primer piso deben tener un nivel asignado",
      path: ["seatTemplateMatrix", "firstFloor", "seats"],
    });
  }

  // Validate second floor seats have tiers if present (only for non-empty seats)
  if (data.seatTemplateMatrix.secondFloor) {
    const secondFloorUnassigned = data.seatTemplateMatrix.secondFloor.seats.some(
      seat => !seat.isEmpty && (!seat.tierId || seat.tierId === "")
    );
    if (secondFloorUnassigned) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Todos los asientos activos del segundo piso deben tener un nivel asignado",
        path: ["seatTemplateMatrix", "secondFloor", "seats"],
      });
    }
  }
});

export const updateBusTypeTemplateSchema = busTypeTemplateSchema.partial();

/**
 * Bus Schemas
 */
const baseBusSchema = z.object({
  companyId: z.string().uuid("ID de empresa inválido"),
  templateId: z.string().uuid("ID de plantilla inválido"),
  plateNumber: z.string().trim().min(1, "La placa es requerida"),
  isActive: z.boolean().default(true),
  maintenanceStatus: z.enum(maintenanceStatusEnum.enumValues).default("active"),
  seatMatrix: z
    .object({
      firstFloor: z.array(z.array(z.string())),
      secondFloor: z.array(z.array(z.string())).optional(),
    })
    .optional(),
});

export const createBusSchema = z.object({
  companyId: z.string().min(1, "La empresa es requerida"),
  templateId: z.string().min(1, "La plantilla es requerida"),
  plateNumber: z.string().trim().min(1, "La placa es requerida"),
  maintenanceStatus: z.enum(maintenanceStatusEnum.enumValues).default("active"),
  isActive: z.boolean().default(true),
});

export const updateBusSchema = baseBusSchema.partial();

/**
 * Seat Tier Schemas
 */
const seatTierSchema = z.object({
  companyId: z.string().uuid("ID de empresa inválido"),
  name: z.string().min(1, "El nombre es requerido").trim(),
  description: z.string().optional(),
  basePrice: z.number().min(0, "El precio base debe ser mayor o igual a 0"),
  isActive: z.boolean().default(true),
});

export const createSeatTierSchema = seatTierSchema;
export const updateSeatTierSchema = seatTierSchema.partial();

/**
 * Bus Seat Schemas
 */
const busSeatSchema = z.object({
  busId: z.string().uuid("ID de bus inválido"),
  seatNumber: z.string().trim().min(1, "El número de asiento es requerido"),
  tierId: z.string().uuid("ID de nivel inválido"),
  status: z.enum(seatStatusEnum.enumValues).default("available"),
  isActive: z.boolean().default(true),
});

export const createBusSeatSchema = busSeatSchema;
export const updateBusSeatSchema = busSeatSchema.partial();

/**
 * Form Types
 */
export type CreateBusTypeTemplateInput = z.infer<typeof createBusTypeTemplateSchema>;
export type UpdateBusTypeTemplateInput = z.infer<typeof updateBusTypeTemplateSchema>;

export type CreateBusInput = z.infer<typeof createBusSchema>;
export type UpdateBusInput = z.infer<typeof updateBusSchema>;

export type CreateSeatTierInput = z.infer<typeof createSeatTierSchema>;
export type UpdateSeatTierInput = z.infer<typeof updateSeatTierSchema>;

export type CreateBusSeatInput = z.infer<typeof createBusSeatSchema>;
export type UpdateBusSeatInput = z.infer<typeof updateBusSeatSchema>;

/**
 * Helper Types for Labels
 */
export type MaintenanceStatusLabel = {
  [K in typeof maintenanceStatusEnum.enumValues[number]]: string;
};

export type SeatStatusLabel = {
  [K in typeof seatStatusEnum.enumValues[number]]: string;
};

export type BusType = "standard" | "luxury" | "double_decker" | "mini";