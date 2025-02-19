import { prisma } from "@/lib/prisma";

/**
 * Checks if a bus is available for a given schedule
 * @param busId The ID of the bus to check
 * @param departureDate The departure date
 * @param departureTime The departure time
 * @param arrivalTime The arrival time
 * @returns true if the bus is available, false otherwise
 */
export async function isBusAvailable(
  busId: string,
  departureDate: Date,
  departureTime: string,
  arrivalTime: string,
): Promise<boolean> {
  try {
    const date = departureDate.toISOString().split('T')[0];
    const startTime = `${date}T${departureTime}:00.000Z`;
    const endTime = `${date}T${arrivalTime}:00.000Z`;

    const existingAssignments = await prisma.bus_assignments.findMany({
      where: {
        bus_id: busId,
        AND: [
          {
            start_time: {
              lte: endTime,
            },
          },
          {
            end_time: {
              gte: startTime,
            },
          },
        ],
      },
    });

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
  const buses = await prisma.buses.findMany({
    where: {
      company_id: companyId,
      is_active: true,
      maintenance_status_enum: "active",
    },
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

/**
 * Validates a route schedule
 * @param routeId The ID of the route
 * @param departureTime The departure time in HH:mm format
 * @returns true if the route schedule is valid, false otherwise
 */
export async function validateRouteSchedule(
  routeId: string,
  departureTime: string,
): Promise<boolean> {
  const existingSchedules = await prisma.route_schedules.findMany({
    where: {
      route_id: routeId,
      departure_time: new Date(`1970-01-01T${departureTime}:00.000Z`),
      active: true,
    },
  });

  return existingSchedules.length === 0;
}
