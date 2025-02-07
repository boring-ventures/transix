import { and, between, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { schedules } from "@/db/schema";
import { Schedule } from "@/types/route.types";

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
  // Convert times to comparable format
  const newDepartureTime = new Date(`1970-01-01T${departureTime}`);
  const newArrivalTime = new Date(`1970-01-01T${arrivalTime}`);

  // Get all schedules for this bus on the same date
  const busSchedules = await db
    .select()
    .from(schedules)
    .where(
      and(
        eq(schedules.busId, busId),
        eq(schedules.departureDate, sql.placeholder("date")),
        or(
          eq(schedules.status, "scheduled"),
          eq(schedules.status, "in_progress")
        ),
        excludeScheduleId ? sql`${schedules.id} != ${excludeScheduleId}` : undefined
      )
    )
    .prepare("check_bus_availability")
    .execute({ date: departureDate.toISOString().split('T')[0] });

  // Check for time conflicts
  for (const schedule of busSchedules) {
    const existingDepartureTime = new Date(`1970-01-01T${schedule.departureTime}`);
    const existingArrivalTime = new Date(`1970-01-01T${schedule.arrivalTime}`);

    // Check if there's any overlap in the time ranges
    if (
      (newDepartureTime >= existingDepartureTime && newDepartureTime < existingArrivalTime) ||
      (newArrivalTime > existingDepartureTime && newArrivalTime <= existingArrivalTime) ||
      (newDepartureTime <= existingDepartureTime && newArrivalTime >= existingArrivalTime)
    ) {
      return false;
    }
  }

  return true;
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
