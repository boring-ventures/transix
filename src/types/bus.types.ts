import { z } from "zod";
import type { Company } from "./company.types";
import { maintenance_status_enum, seat_status_enum } from "@prisma/client";

/**
 * Base Types
 */
export interface Bus {
  id: string;
  plateNumber: string;
  isActive: boolean;
  maintenanceStatus: string;
  assignments?: Array<{
    startTime: string;
    endTime: string;
    status: string;
  }>;
  template?: {
    id: string;
    name: string;
    type: string;
    seatTemplateMatrix?: {
      firstFloor: {
        dimensions: { rows: number; seatsPerRow: number };
        seats: Array<{
          id: string;
          name: string;
          tierId: string;
          row: number;
          column: number;
          isEmpty: boolean;
        }>;
      };
      secondFloor?: {
        dimensions: { rows: number; seatsPerRow: number };
        seats: Array<{
          id: string;
          name: string;
          tierId: string;
          row: number;
          column: number;
          isEmpty: boolean;
        }>;
      };
    };
  };
  seats?: Array<{
    seatNumber: string;
    status: string;
    tier?: {
      id: string;
      name: string;
      basePrice: number;
    };
  }>;
  bus_type_templates: {
    seat_template_matrix: string;
  };
}

export type BusSeat = {
  id: string;
  busId: string;
  seatNumber: string;
  tierId: string;
  status: seat_status_enum;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tier?: {
    id: string;
    name: string;
    basePrice: number;
  };
};

export type BusTypeTemplate = {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  totalCapacity: number;
  type: string;
  seatsLayout: string;
  seatTemplateMatrix: {
    firstFloor: {
      dimensions: {
        rows: number;
        seatsPerRow: number;
      };
      seats: SeatPosition[];
    };
    secondFloor?: {
      dimensions: {
        rows: number;
        seatsPerRow: number;
      };
      seats: SeatPosition[];
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: Company;
};

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
  status: string;
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
  type: z.string().default("standard"),
  seatsLayout: z.string().default(""),
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
          status: z.string().default("available"),
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
          status: z.string().default("available"),
        })
      ),
    }).optional(),
  }),
  isActive: z.boolean().default(true),
});

export const createBusTypeTemplateSchema = busTypeTemplateSchema;
export const updateBusTypeTemplateSchema = busTypeTemplateSchema.partial();

/**
 * Bus Schemas
 */
const baseBusSchema = z.object({
  companyId: z.string().uuid("ID de empresa inválido"),
  templateId: z.string().uuid("ID de plantilla inválido"),
  plateNumber: z.string().trim().min(1, "La placa es requerida"),
  isActive: z.boolean().default(true),
  maintenanceStatus: z.nativeEnum(maintenance_status_enum).default(maintenance_status_enum.active),
  seatMatrix: z
    .object({
      firstFloor: z.array(z.array(z.string())),
      secondFloor: z.array(z.array(z.string())).optional(),
    })
    .optional(),
});

export const createBusSchema = z.object({
  companyId: z.string().uuid("ID de empresa inválido"),
  templateId: z.string().uuid("ID de plantilla inválido"),
  plateNumber: z.string().trim().min(1, "La placa es requerida"),
  maintenanceStatus: z.nativeEnum(maintenance_status_enum).default(maintenance_status_enum.active),
  isActive: z.boolean().default(true),
});

export const updateBusSchema = baseBusSchema.partial();

/**
 * Bus Seat Schemas
 */
const busSeatSchema = z.object({
  busId: z.string().uuid("ID de bus inválido"),
  seatNumber: z.string().min(1, "El número de asiento es requerido"),
  tierId: z.string().uuid("ID de nivel inválido"),
  status: z.nativeEnum(seat_status_enum).default(seat_status_enum.available),
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

export type CreateBusSeatInput = z.infer<typeof createBusSeatSchema>;
export type UpdateBusSeatInput = z.infer<typeof updateBusSeatSchema>;

/**
 * Helper Types for Labels
 */
export type MaintenanceStatusLabel = {
  [K in maintenance_status_enum]: string;
};

export type SeatStatusLabel = {
  [K in seat_status_enum]: string;
};

export type BusType = "standard" | "luxury" | "double_decker" | "mini";

/**
 * Seat Tier Schemas
 */
export const createSeatTierSchema = z.object({
  companyId: z.string().uuid("ID de empresa inválido"),
  name: z.string().min(1, "El nombre es requerido").trim(),
  description: z.string().nullable(),
  basePrice: z.number().min(0, "El precio base debe ser mayor o igual a 0"),
  isActive: z.boolean().default(true),
});

export const updateSeatTierSchema = createSeatTierSchema.partial();

export type CreateSeatTierInput = z.infer<typeof createSeatTierSchema>;

export interface SeatTier {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  companyId: string;
  isActive: boolean;
}

export type UpdateSeatTierInput = {
  name?: string;
  basePrice?: number;
  description?: string | null;
  isActive?: boolean;
};