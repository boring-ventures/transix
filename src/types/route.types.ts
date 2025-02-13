import { routes, locations, eventTypeEnum, busLogs, occupancyLogs, routeSchedules } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";

/**
 * Database model types
 */
export type Route = InferSelectModel<typeof routes>;
export type RouteSchedule = InferSelectModel<typeof routeSchedules>;
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
};

/**
 * Enums
 */
const operatingDaysEnum = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

/**
 * Base Schemas
 */
const locationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").trim(),
});

const routeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").trim(),
  originId: z.string().uuid("ID de origen inválido"),
  destinationId: z.string().uuid("ID de destino inválido"),
  estimatedDuration: z.number().min(1, "La duración estimada debe ser mayor a 0"),
  active: z.boolean().default(true),
});

export const createRouteScheduleSchema = z.object({
  routeId: z.string().uuid("ID de ruta inválido"),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "La hora debe estar en formato HH:MM",
  }),
  operatingDays: z.array(z.enum(operatingDaysEnum)).min(1, {
    message: "Debe seleccionar al menos un día de operación",
  }),
  seasonStart: z.coerce.date({
    required_error: "La fecha de inicio es requerida",
    invalid_type_error: "La fecha de inicio debe ser una fecha válida",
  }),
  seasonEnd: z.coerce.date({
    required_error: "La fecha de fin es requerida",
    invalid_type_error: "La fecha de fin debe ser una fecha válida",
  }),
  active: z.boolean().default(true),
}).refine((data) => {
  return data.seasonStart <= data.seasonEnd;
}, {
  message: "La fecha de inicio debe ser anterior o igual a la fecha de fin",
  path: ["seasonStart"],
});

const busLogSchema = z.object({
  scheduleId: z.string().uuid("ID de horario inválido"),
  eventType: z.enum(eventTypeEnum.enumValues),
  locationId: z.string().uuid("ID de ubicación inválido"),
  loggedBy: z.string().uuid("ID de usuario inválido"),
});

const occupancyLogSchema = z.object({
  scheduleId: z.string().uuid("ID de horario inválido"),
  occupiedSeats: z.number().min(0),
});

/**
 * Export Schemas
 */
export const createLocationSchema = locationSchema;
export const updateLocationSchema = locationSchema.partial();

export const createRouteSchema = routeSchema;
export const updateRouteSchema = routeSchema.partial();

// For route schedules, we'll create a separate update schema since the base schema has refinements
export const updateRouteScheduleSchema = z.object({
  routeId: z.string().uuid("ID de ruta inválido").optional(),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "La hora debe estar en formato HH:MM",
  }).optional(),
  operatingDays: z.array(z.enum(operatingDaysEnum)).min(1, {
    message: "Debe seleccionar al menos un día de operación",
  }).optional(),
  seasonStart: z.coerce.date({
    invalid_type_error: "La fecha de inicio debe ser una fecha válida",
  }).optional(),
  seasonEnd: z.coerce.date({
    invalid_type_error: "La fecha de fin debe ser una fecha válida",
  }).optional(),
  active: z.boolean().optional(),
});

export const createBusLogSchema = busLogSchema;
export const updateBusLogSchema = busLogSchema.partial();

export const createOccupancyLogSchema = occupancyLogSchema;
export const updateOccupancyLogSchema = occupancyLogSchema.partial();

/**
 * Export Types
 */
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;

export type CreateRouteScheduleInput = z.infer<typeof createRouteScheduleSchema>;
export type UpdateRouteScheduleInput = z.infer<typeof updateRouteScheduleSchema>;

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