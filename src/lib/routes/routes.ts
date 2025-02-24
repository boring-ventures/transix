import { prisma } from "@/lib/prisma";
import type { CreateRouteInput, CreateRouteScheduleInput } from "@/types/route.types";

/**
 * Creates a new route
 */
export async function createRoute(input: CreateRouteInput) {
  const route = await prisma.routes.create({
    data: {
      name: input.name,
      origin_id: input.originId,
      destination_id: input.destinationId,
      estimated_duration: input.estimatedDuration,
      active: true,
    },
  });

  return route;
}

/**
 * Creates a new schedule for a route
 */
export async function createRouteSchedule(input: CreateRouteScheduleInput) {
  const routeSchedule = await prisma.route_schedules.create({
    data: {
      route_id: input.routeId,
      departure_time: new Date(`1970-01-01T${input.departureTime}:00.000Z`),
      estimated_arrival_time: new Date(`1970-01-01T${input.estimatedArrivalTime}:00.000Z`),
      operating_days: input.operatingDays,
      active: true,
      season_start: input.seasonStart,
      season_end: input.seasonEnd,
    },
  });

  return routeSchedule;
}

/**
 * Updates a schedule
 */
export async function updateSchedule(
  id: string,
  updates: {
    busId?: string;
    departureDate?: Date;
    price?: number;
    status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  }
) {
  const updatedSchedule = await prisma.schedules.update({
    where: { id },
    data: {
      bus_id: updates.busId,
      departure_date: updates.departureDate,
      price: updates.price,
      status: updates.status,
      updated_at: new Date(),
    },
  });

  return updatedSchedule;
}

export const createSchedule = async (
  routeId: string,
  busId: string,
  departureDate: Date,
  estimatedArrivalTime: string,
  price: number,
  routeScheduleId: string
) => {
  const schedule = await prisma.schedules.create({
    data: {
      route_id: routeId,
      bus_id: busId,
      route_schedule_id: routeScheduleId,
      departure_date: departureDate,
      estimated_arrival_time: new Date(estimatedArrivalTime),
      price,
      status: 'scheduled',
      created_at: new Date(),
      updated_at: new Date()
    },
  });

  return schedule;
};
