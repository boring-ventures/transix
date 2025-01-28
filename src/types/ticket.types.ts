import { tickets, ticketStatusEnum, ticketReassignments, ticketCancellations } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import { Schedule } from "./route.types";
import { BusSeat } from "./bus.types";

/**
 * Database model types
 */
export type Ticket = InferSelectModel<typeof tickets>;
export type TicketReassignment = InferSelectModel<typeof ticketReassignments>;
export type TicketCancellation = InferSelectModel<typeof ticketCancellations>;

export type TicketWithRelations = Ticket & {
  schedule?: Schedule;
  busSeat?: BusSeat;
  reassignments?: TicketReassignment[];
  cancellation?: TicketCancellation;
};

/**
 * Ticket Schemas
 */
const ticketSchema = z.object({
  scheduleId: z.string().uuid("ID de horario inválido"),
  customerId: z.string().uuid("ID de cliente inválido"),
  busSeatId: z.string().uuid("ID de asiento inválido"),
  status: z.enum(ticketStatusEnum.enumValues).default("active"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
});

export const createTicketSchema = ticketSchema;
export const updateTicketSchema = ticketSchema.partial();

/**
 * Ticket Reassignment Schemas
 */
const ticketReassignmentSchema = z.object({
  ticketId: z.string().uuid("ID de ticket inválido"),
  oldScheduleId: z.string().uuid("ID de horario anterior inválido"),
  newScheduleId: z.string().uuid("ID de nuevo horario inválido"),
  reason: z.string().min(1, "La razón es requerida").trim(),
});

export const createTicketReassignmentSchema = ticketReassignmentSchema;
export const updateTicketReassignmentSchema = ticketReassignmentSchema.partial();

/**
 * Ticket Cancellation Schemas
 */
const ticketCancellationSchema = z.object({
  ticketId: z.string().uuid("ID de ticket inválido"),
  reason: z.string().min(1, "La razón es requerida").trim(),
});

export const createTicketCancellationSchema = ticketCancellationSchema;
export const updateTicketCancellationSchema = ticketCancellationSchema.partial();

/**
 * Form Types
 */
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

export type CreateTicketReassignmentInput = z.infer<typeof createTicketReassignmentSchema>;
export type UpdateTicketReassignmentInput = z.infer<typeof updateTicketReassignmentSchema>;

export type CreateTicketCancellationInput = z.infer<typeof createTicketCancellationSchema>;
export type UpdateTicketCancellationInput = z.infer<typeof updateTicketCancellationSchema>;

/**
 * Helper Types for Labels
 */
export type TicketStatusLabel = {
  [K in typeof ticketStatusEnum.enumValues[number]]: string;
}; 