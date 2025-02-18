import { z } from "zod";
import type { Company } from "./company.types";
import { maintenance_status_enum, seat_status_enum } from "@prisma/client";

/**
 * Base Types
 */
export type Bus = {
  id: string;
  plateNumber: string;
  templateId: string;
  isActive: boolean;
  maintenanceStatus: maintenance_status_enum;
  companyId: string;
  seatMatrix: {
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
  createdAt: Date;
  updatedAt: Date;
  template?: {
    id: string;
    name: string;
    type: string;
  };
  assignments?: {
    id: string;
    status: 'active' | 'completed' | 'cancelled';
    startTime: Date;
    endTime: Date;
  }[];
};

export type BusSeat = {
  id: string;
  busId: string;
  seatNumber: string;
  tierId: string;
  status: seat_status_enum;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  companyId: z.string().min(1, "La empresa es requerida"),
  templateId: z.string().min(1, "La plantilla es requerida"),
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

export type CreateSeatTierInput = z.infer<typeof createSeatTierSchema>;