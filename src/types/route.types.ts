import { routes, schedules, locations, eventTypeEnum, busLogs, occupancyLogs, routeSchedules } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import { Bus } from "./bus.types";

/**
 * Database model types
 */
export type Route = InferSelectModel<typeof routes>;
export type RouteSchedule = InferSelectModel<typeof routeSchedules>;
export type Schedule = {
  id: string;
  routeId: string;
  routeScheduleId: string;
  busId: string;
  departureDate: string;
  estimatedArrivalTime: Date;
  actualDepartureTime: Date | null;
  actualArrivalTime: Date | null;
  price: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
};
export type Location = InferSelectModel<typeof locations>;
export type BusLog = InferSelectModel<typeof busLogs>;
export type OccupancyLog = InferSelectModel<typeof occupancyLogs>;

export type RouteWithRelations = Route & {
  origin?: Location;
  destination?: Location;
  routeSchedules?: RouteSchedule[];
};

export type RouteScheduleWithRelations = RouteSchedule & {
  route?: Route;
  schedules?: Schedule[];
};

export type ScheduleWithRelations = Schedule & {
  route?: Route;
  routeSchedule?: RouteSchedule;
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
  estimatedDuration: z.number().min(1, "La duración estimada debe ser mayor a 0"),
  active: z.boolean().default(true),
});

const routeScheduleSchema = z.object({
  routeId: z.string().uuid("ID de ruta inválido"),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm)"),
  operatingDays: z.array(
    z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const)
  ).min(1, "Debe seleccionar al menos un día de operación"),
  active: z.boolean().default(true),
  seasonStart: z.date().optional(),
  seasonEnd: z.date().optional()
});

const scheduleSchema = z.object({
  routeId: z.string().uuid("ID de ruta inválido"),
  routeScheduleId: z.string().uuid("ID de horario de ruta inválido"),
  busId: z.string().uuid("ID de bus inválido"),
  departureDate: z.string().min(1, "La fecha de salida es requerida"),
  estimatedArrivalTime: z.string().datetime("Formato de fecha y hora inválido"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
});

export const createRouteSchema = routeSchema;
export const updateRouteSchema = routeSchema.partial();
export const createRouteScheduleSchema = routeScheduleSchema;
export const updateRouteScheduleSchema = routeScheduleSchema.partial();
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

export type CreateRouteInput = {
  name: string;
  originId: string;
  destinationId: string;
  estimatedDuration: number;
  active?: boolean;
};

export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;

export type CreateRouteScheduleInput = {
  routeId: string;
  departureTime: string;
  operatingDays: string[];
  seasonStart?: Date;
  seasonEnd?: Date;
  active?: boolean;
};

export type UpdateRouteScheduleInput = z.infer<typeof updateRouteScheduleSchema>;

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