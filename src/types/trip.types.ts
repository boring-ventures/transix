import { z } from "zod";
import { Schedule } from "./route.types";
import { settlement_status_enum, passenger_status_enum } from "@prisma/client";

export type PassengerList = {
  id: string;
  scheduleId: string;
  documentId: string | null; // Número de CI
  fullName: string;
  seatNumber: string;
  status: passenger_status_enum;
  createdAt: Date;
  updatedAt: Date;
};

export type TripManifest = {
  companyName: string; // Nombre de la flota
  origin: string;
  destination: string;
  departureTime: string;
  bus: {
    brand: string; // Marca del bus
    model: string; // Modelo del bus
    plateNumber: string; // Placa
  };
  driver: {
    fullName: string;
    licenseNumber: string;
  };
  departureDate: Date;
  passengers: PassengerList[];
};

export type TripSettlement = {
  id: string;
  scheduleId: string;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  status: settlement_status_enum;
  details: {
    fares: Array<{
      quantity: number;
      amount: number;
      total: number;
    }>;
    expenses: Array<{
      description: string;
      amount: number;
    }>;
    packages: number;
  };
  settledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  schedule?: Schedule;
};

export const createTripSettlementSchema = z.object({
  scheduleId: z.string().uuid("ID de viaje inválido"),
  totalIncome: z.number().min(0, "El ingreso total debe ser mayor o igual a 0"),
  totalExpenses: z.number().min(0, "Los gastos totales deben ser mayor o igual a 0"),
  details: z.object({
    fares: z.array(z.object({
      quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
      amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
      total: z.number().min(0, "El total debe ser mayor o igual a 0"),
    })),
    expenses: z.array(z.object({
      description: z.string().min(1, "La descripción es requerida"),
      amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
    })),
    packages: z.number().min(0, "El monto de encomiendas debe ser mayor o igual a 0"),
  }),
});

export const updateTripSettlementSchema = z.object({
  totalIncome: z.number().min(0, "El ingreso total debe ser mayor o igual a 0").optional(),
  totalExpenses: z.number().min(0, "Los gastos totales deben ser mayor o igual a 0").optional(),
  details: z.object({
    fares: z.array(z.object({
      quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
      amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
      total: z.number().min(0, "El total debe ser mayor o igual a 0"),
    })),
    expenses: z.array(z.object({
      description: z.string().min(1, "La descripción es requerida"),
      amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
    })),
    packages: z.number().min(0, "El monto de encomiendas debe ser mayor o igual a 0"),
  }).optional(),
  status: z.nativeEnum(settlement_status_enum).optional(),
});

export type CreateTripSettlementInput = z.infer<typeof createTripSettlementSchema>;
export type UpdateTripSettlementInput = z.infer<typeof updateTripSettlementSchema>; 