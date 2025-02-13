import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { routes, schedules, routeSchedules } from "@/db/schema";
import { CreateRouteInput, Route, RouteSchedule, CreateRouteScheduleInput } from "@/types/route.types";

/**
 * Creates a new route
 */
export async function createRoute(input: CreateRouteInput) {
  const [route] = await db
    .insert(routes)
    .values({
      name: input.name,
      originId: input.originId,
      destinationId: input.destinationId,
      estimatedDuration: input.estimatedDuration,
      active: true,
    })
    .returning();

  return route;
}

/**
 * Creates a new schedule for a route
 */
export async function createRouteSchedule(input: CreateRouteScheduleInput) {
  type RouteScheduleInsert = typeof routeSchedules.$inferInsert;
  
  const insertData: RouteScheduleInsert = {
    routeId: input.routeId,
    departureTime: input.departureTime,
    operatingDays: input.operatingDays,
    active: true,
    seasonStart: input.seasonStart?.toISOString().split('T')[0] || null,
    seasonEnd: input.seasonEnd?.toISOString().split('T')[0] || null,
  };

  const [routeSchedule] = await db
    .insert(routeSchedules)
    .values(insertData)
    .returning();

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
  const [updatedSchedule] = await db
    .update(schedules)
    .set({
      ...updates,
      departureDate: updates.departureDate?.toISOString().split('T')[0],
      updatedAt: new Date(),
    })
    .where(eq(schedules.id, id))
    .returning();

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
  type ScheduleInsert = typeof schedules.$inferInsert;

  const insertData: ScheduleInsert = {
    routeId,
    busId,
    routeScheduleId,
    departureDate: departureDate.toISOString().split('T')[0],
    estimatedArrivalTime: new Date(estimatedArrivalTime),
    price,
    status: 'scheduled' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const [schedule] = await db
    .insert(schedules)
    .values(insertData)
    .returning();

  return schedule;
};
