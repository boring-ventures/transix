import { z } from "zod";
import { schedule_status_enum, bus_assignment_status_enum } from "@prisma/client";

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

const operatingDaysEnum = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

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

/**
 * Export Types
 */
export type Route = {
  id: string;
  name: string;
  originId: string;
  destinationId: string;
  estimatedDuration: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RouteSchedule = {
  id: string;
  routeId: string;
  departureTime: string;
  operatingDays: typeof operatingDaysEnum[number][];
  active: boolean;
  seasonStart: Date | null;
  seasonEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
  bus?: {
    id: string;
    plateNumber: string;
    template?: {
      id: string;
      type: string;
      seatsLayout: string;
    };
    seats: {
      id: string;
      seatNumber: string;
      status: string;
      tier?: {
        id: string;
        name: string;
        basePrice: number;
      };
    }[];
  };
  route?: Route;
};

export type BusAssignment = {
  id: string;
  busId: string;
  routeId: string;
  scheduleId: string;
  status: bus_assignment_status_enum;
  assignedAt: Date;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  bus?: {
    id: string;
    plateNumber: string;
    template?: {
      id: string;
      name: string;
    };
  };
};

export type Schedule = {
  id: string;
  routeId: string;
  routeScheduleId: string;
  busId: string | null;
  departureDate: Date;
  estimatedArrivalTime: Date;
  actualDepartureTime: Date | null;
  actualArrivalTime: Date | null;
  price: number;
  status: schedule_status_enum;
  createdAt: Date;
  updatedAt: Date;
  busAssignments?: BusAssignment[];
};

export type RouteWithRelations = Route & {
  origin?: Location;
  destination?: Location;
  routeSchedules?: RouteSchedule[];
};

export type RouteScheduleWithRelations = RouteSchedule & {
  route?: Route;
};

export type Location = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateLocationInput = z.infer<typeof locationSchema>;
export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
export type CreateRouteScheduleInput = z.infer<typeof createRouteScheduleSchema>;
export type UpdateRouteScheduleInput = z.infer<typeof updateRouteScheduleSchema>;