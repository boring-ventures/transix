import { routes, schedules, locations, eventTypeEnum, busLogs, occupancyLogs } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import { Bus } from "./bus.types";

/**
 * Database model types
 */
export type Route = InferSelectModel<typeof routes>;
export type Schedule = InferSelectModel<typeof schedules>;
export type Location = InferSelectModel<typeof locations>;
export type BusLog = InferSelectModel<typeof busLogs>;
export type OccupancyLog = InferSelectModel<typeof occupancyLogs>;

export type RouteWithRelations = Route & {
  origin?: Location;
  destination?: Location;
  schedules?: Schedule[];
};

export type ScheduleWithRelations = Schedule & {
  route?: Route;
  bus?: Bus;
  busLogs?: BusLog[];
  occupancyLogs?: OccupancyLog[];
};

/**
 * Location Schemas
 */
const locationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").trim(),
});

export const createLocationSchema = locationSchema;
export const updateLocationSchema = locationSchema.partial();

/**
 * Route Schemas
 */
const routeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").trim(),
  originId: z.string().uuid("ID de origen inválido"),
  destinationId: z.string().uuid("ID de destino inválido"),
  companyId: z.string().uuid("ID de compañía inválido"),
  defaultBusId: z.string().uuid("ID de bus inválido").optional(),
  estimatedDuration: z.number().min(1, "La duración estimada debe ser mayor a 0"),
  active: z.boolean().default(true),
  capacity: z.number().min(1, "La capacidad debe ser mayor a 0"),
  seatsTaken: z.number().min(0).default(0),
});

export const createRouteSchema = routeSchema;
export const updateRouteSchema = routeSchema.partial();

/**
 * Schedule Schemas
 */
const scheduleSchema = z.object({
  routeId: z.string().uuid("ID de ruta inválido"),
  busId: z.string().uuid("ID de bus inválido"),
  departureDate: z.date(),
  departureTime: z.string(), // HH:mm format
  arrivalTime: z.string(), // HH:mm format
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  capacity: z.number().min(1, "La capacidad debe ser mayor a 0"),
  availableSeats: z.number().min(0, "Los asientos disponibles no pueden ser negativos"),
});

export const createScheduleSchema = scheduleSchema;
export const updateScheduleSchema = scheduleSchema.partial();

/**
 * Bus Log Schemas
 */
const busLogSchema = z.object({
  scheduleId: z.string().uuid("ID de horario inválido"),
  eventType: z.enum(eventTypeEnum.enumValues),
  locationId: z.string().uuid("ID de ubicación inválido"),
  loggedBy: z.string().uuid("ID de usuario inválido"),
});

export const createBusLogSchema = busLogSchema;
export const updateBusLogSchema = busLogSchema.partial();

/**
 * Occupancy Log Schemas
 */
const occupancyLogSchema = z.object({
  scheduleId: z.string().uuid("ID de horario inválido"),
  occupiedSeats: z.number().min(0),
});

export const createOccupancyLogSchema = occupancyLogSchema;
export const updateOccupancyLogSchema = occupancyLogSchema.partial();

/**
 * Form Types
 */
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export type CreateBusLogInput = z.infer<typeof createBusLogSchema>;
export type UpdateBusLogInput = z.infer<typeof updateBusLogSchema>;

export type CreateOccupancyLogInput = z.infer<typeof createOccupancyLogSchema>;
export type UpdateOccupancyLogInput = z.infer<typeof updateOccupancyLogSchema>;

/**
 * Helper Types for Labels
 */
export type EventTypeLabel = {
  [K in typeof eventTypeEnum.enumValues[number]]: string;
}; 