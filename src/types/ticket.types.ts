import { z } from "zod";
import { ticket_status_enum } from "@prisma/client";
import { Schedule } from "./route.types";
import { BusSeat } from "./bus.types";

/**
 * Base Types
 */
export type Ticket = {
  id: string;
  scheduleId: string | null;
  customerId: string | null;
  busSeatId: string;
  status: ticket_status_enum;
  price: number;
  purchasedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  purchasedAt: Date;
};

export type TicketCancellation = {
  id: string;
  ticketId: string | null;
  reason: string;
  cancelledAt: Date;
};

export type TicketReassignment = {
  id: string;
  ticketId: string | null;
  oldScheduleId: string | null;
  newScheduleId: string | null;
  reason: string;
  reassignedAt: Date;
};

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
  scheduleId: z.string().uuid("ID de horario inválido").nullable(),
  customerId: z.string().uuid("ID de cliente inválido").nullable(),
  busSeatId: z.string().uuid("ID de asiento inválido"),
  status: z.nativeEnum(ticket_status_enum).default(ticket_status_enum.active),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  purchasedBy: z.string().uuid("ID de usuario inválido").nullable(),
  notes: z.string().nullable(),
});

export const createTicketSchema = ticketSchema;
export const updateTicketSchema = ticketSchema.partial();

/**
 * Cancellation Schemas
 */
const cancellationSchema = z.object({
  ticketId: z.string().uuid("ID de ticket inválido"),
  reason: z.string().min(1, "La razón es requerida"),
});

export const createCancellationSchema = cancellationSchema;
export const updateCancellationSchema = cancellationSchema.partial();

/**
 * Reassignment Schemas
 */
const reassignmentSchema = z.object({
  ticketId: z.string().uuid("ID de ticket inválido"),
  oldScheduleId: z.string().uuid("ID de horario anterior inválido"),
  newScheduleId: z.string().uuid("ID de nuevo horario inválido"),
  reason: z.string().min(1, "La razón es requerida"),
});

export const createReassignmentSchema = reassignmentSchema;
export const updateReassignmentSchema = reassignmentSchema.partial();

/**
 * Form Types
 */
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

export type CreateCancellationInput = z.infer<typeof createCancellationSchema>;
export type UpdateCancellationInput = z.infer<typeof updateCancellationSchema>;

export type CreateReassignmentInput = z.infer<typeof createReassignmentSchema>;
export type UpdateReassignmentInput = z.infer<typeof updateReassignmentSchema>;

/**
 * Helper Types for Labels
 */
export type TicketStatusLabel = {
  [K in ticket_status_enum]: string;
}; 