import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { routes, schedules, buses } from "@/db/schema";
import { CreateRouteInput, Route, UpdateRouteInput } from "@/types/route.types";
import { calculateArrivalTime, isBusAvailable } from "./validation";
import { BusSeatMatrix } from "@/types/bus.types";

/**
 * Creates a new route
 */
export async function createRoute(input: CreateRouteInput): Promise<Route> {
  const [route] = await db
    .insert(routes)
    .values(input)
    .returning();

  return route;
}

/**
 * Updates an existing route
 */
export async function updateRoute(
  id: string,
  input: UpdateRouteInput
): Promise<Route> {
  const [route] = await db
    .update(routes)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(routes.id, id))
    .returning();

  return route;
}

/**
 * Gets a route by ID with its relations
 */
export async function getRouteById(id: string) {
  const route = await db.query.routes.findFirst({
    where: eq(routes.id, id),
    with: {
      origin: true,
      destination: true,
    },
  });

  if (!route) return null;

  if (route.defaultBusId) {
    const bus = await db.query.buses.findFirst({
      where: eq(buses.id, route.defaultBusId),
    });
    if (bus) {
      return { ...route, defaultBus: bus };
    }
  }

  return route;
}

/**
 * Gets all routes for a company
 */
export async function getRoutesByCompany(companyId: string) {
  const routesList = await db.query.routes.findMany({
    where: (routes, { eq, and }) =>
      and(eq(routes.companyId, companyId), eq(routes.active, true)),
    with: {
      origin: true,
      destination: true,
    },
  });

  // Fetch buses separately to avoid type issues
  const routesWithBuses = await Promise.all(
    routesList.map(async (route) => {
      if (route.defaultBusId) {
        const bus = await db.query.buses.findFirst({
          where: eq(buses.id, route.defaultBusId),
        });
        if (bus) {
          return { ...route, defaultBus: bus };
        }
      }
      return route;
    })
  );

  return routesWithBuses;
}

/**
 * Soft deletes a route by setting active to false
 */
export async function deleteRoute(id: string): Promise<Route> {
  const [route] = await db
    .update(routes)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(routes.id, id))
    .returning();

  return route;
}

/**
 * Creates a new schedule for a route
 */
export async function createSchedule(
  routeId: string,
  busId: string,
  departureDate: Date,
  departureTime: string,
  price: number
) {
  // Get the route to calculate arrival time
  const route = await getRouteById(routeId);
  if (!route) {
    throw new Error("Route not found");
  }

  // Calculate arrival time
  const arrivalTime = calculateArrivalTime(departureTime, route.estimatedDuration);

  // Check if bus is available
  const busAvailable = await isBusAvailable(
    busId,
    departureDate,
    departureTime,
    arrivalTime
  );

  if (!busAvailable) {
    throw new Error("Bus is not available for this schedule");
  }

  // Get bus capacity
  const bus = await db.query.buses.findFirst({
    where: eq(buses.id, busId),
  });

  if (!bus) {
    throw new Error("Bus not found");
  }

  const seatMatrix = bus.seatMatrix as BusSeatMatrix;
  const firstFloorSeats = seatMatrix.firstFloor.seats.length;
  const secondFloorSeats = seatMatrix.secondFloor?.seats.length || 0;
  const totalSeats = firstFloorSeats + secondFloorSeats;

  // Create schedule
  const [schedule] = await db
    .insert(schedules)
    .values({
      routeId,
      busId,
      departureDate: departureDate.toISOString().split('T')[0],
      departureTime,
      arrivalTime,
      price: price.toString(),
      capacity: totalSeats,
      availableSeats: totalSeats,
      status: "scheduled",
    })
    .returning();

  return schedule;
}

/**
 * Updates a schedule
 */
export async function updateSchedule(
  id: string,
  updates: {
    busId?: string;
    departureDate?: Date;
    departureTime?: string;
    price?: number;
    status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  }
) {
  const schedule = await db.query.schedules.findFirst({
    where: eq(schedules.id, id),
    with: {
      route: true,
    },
  });

  if (!schedule || !schedule.route) {
    throw new Error("Schedule not found");
  }

  let updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: new Date(),
  };

  // If updating time or bus, check availability
  if (updates.busId || updates.departureDate || updates.departureTime) {
    const currentBusId = updates.busId || schedule.busId;
    if (!currentBusId) {
      throw new Error("Bus ID is required");
    }
    
    const departureDate = updates.departureDate || new Date(schedule.departureDate);
    const departureTime = updates.departureTime || schedule.departureTime;
    
    // Ensure route is properly typed from the join
    const routeWithDuration = schedule.route as unknown as { estimatedDuration: number };
    const arrivalTime = calculateArrivalTime(
      departureTime,
      routeWithDuration.estimatedDuration
    );

    const busAvailable = await isBusAvailable(
      currentBusId,
      departureDate,
      departureTime,
      arrivalTime,
      id // Exclude current schedule from availability check
    );

    if (!busAvailable) {
      throw new Error("Bus is not available for this schedule");
    }

    // If changing bus, update capacity
    if (updates.busId) {
      const bus = await db.query.buses.findFirst({
        where: eq(buses.id, updates.busId),
      });

      if (!bus) {
        throw new Error("Bus not found");
      }

      const seatMatrix = bus.seatMatrix as BusSeatMatrix;
      const firstFloorSeats = seatMatrix.firstFloor.seats.length;
      const secondFloorSeats = seatMatrix.secondFloor?.seats.length || 0;
      const totalSeats = firstFloorSeats + secondFloorSeats;

      updateData = {
        ...updateData,
        capacity: totalSeats,
        availableSeats: totalSeats - (schedule.capacity - schedule.availableSeats),
      };
    }

    if (updates.departureDate) {
      updateData.departureDate = updates.departureDate.toISOString().split('T')[0];
    }

    if (updates.price) {
      updateData.price = updates.price.toString();
    }
  }

  const [updatedSchedule] = await db
    .update(schedules)
    .set(updateData)
    .where(eq(schedules.id, id))
    .returning();

  return updatedSchedule;
}
