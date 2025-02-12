import { and, between, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { schedules, busAssignments, routeSchedules } from "@/db/schema";
import { Schedule } from "@/types/route.types";
import { and as drizzleAnd, lt, gt } from "drizzle-orm";

/**
 * Checks if a bus is available for a given schedule
 * @param busId The ID of the bus to check
 * @param departureDate The departure date
 * @param departureTime The departure time
 * @param arrivalTime The arrival time
 * @param excludeScheduleId Optional schedule ID to exclude from the check (useful for updates)
 * @returns true if the bus is available, false otherwise
 */
export async function isBusAvailable(
  busId: string,
  departureDate: Date,
  departureTime: string,
  arrivalTime: string,
  excludeScheduleId?: string
): Promise<boolean> {
  try {
    const date = departureDate.toISOString().split('T')[0];
    const startDateTime = new Date(`${date}T${departureTime}`);
    const endDateTime = new Date(`${date}T${arrivalTime}`);

    const existingAssignments = await db
      .select()
      .from(busAssignments)
      .where(
        and(
          eq(busAssignments.busId, busId),
          sql`DATE(${busAssignments.startTime}) = ${date}::date`,
          sql`${busAssignments.startTime}::time <= ${arrivalTime}::time`,
          sql`${busAssignments.endTime}::time >= ${departureTime}::time`
        )
      );

    return existingAssignments.length === 0;
  } catch (error) {
    console.error("Error checking bus availability:", error);
    return false;
  }
}

/**
 * Gets all available buses for a given schedule
 * @param companyId The ID of the company
 * @param departureDate The departure date
 * @param departureTime The departure time
 * @param arrivalTime The arrival time
 * @returns Array of available bus IDs
 */
export async function getAvailableBuses(
  companyId: string,
  departureDate: Date,
  departureTime: string,
  arrivalTime: string
): Promise<string[]> {
  // First, get all active buses for the company
  const buses = await db.query.buses.findMany({
    where: (buses, { eq, and }) => 
      and(
        eq(buses.companyId, companyId),
        eq(buses.isActive, true),
        eq(buses.maintenanceStatus, "active")
      ),
  });

  // Check availability for each bus
  const availableBuses: string[] = [];
  
  for (const bus of buses) {
    const isAvailable = await isBusAvailable(
      bus.id,
      departureDate,
      departureTime,
      arrivalTime
    );
    
    if (isAvailable) {
      availableBuses.push(bus.id);
    }
  }

  return availableBuses;
}

/**
 * Calculates the estimated arrival time based on departure time and route duration
 * @param departureTime The departure time in HH:mm format
 * @param durationMinutes The duration in minutes
 * @returns The arrival time in HH:mm format
 */
export function calculateArrivalTime(
  departureTime: string,
  durationMinutes: number
): string {
  const [hours, minutes] = departureTime.split(":").map(Number);
  const departureDate = new Date(1970, 0, 1, hours, minutes);
  
  departureDate.setMinutes(departureDate.getMinutes() + durationMinutes);
  
  return departureDate.toTimeString().slice(0, 5);
}

export async function validateRouteSchedule(
  routeId: string,
  departureTime: string,
  operatingDays: string[],
  seasonStart?: Date,
  seasonEnd?: Date
): Promise<boolean> {
  const existingSchedules = await db
    .select()
    .from(routeSchedules)
    .where(
      and(
        eq(routeSchedules.routeId, routeId),
        eq(routeSchedules.departureTime, departureTime),
        eq(routeSchedules.active, true)
      )
    );

  // Validar superposición de horarios y temporadas
  return existingSchedules.length === 0;
}
