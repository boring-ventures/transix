import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, format, parseISO, setHours, setMinutes } from "date-fns";

export async function GET() {
  try {
    const schedules = await prisma.schedules.findMany({
      include: {
        routes: true,
        route_schedules: true,
        buses: true,
      },
    });

    // Transform the data to match the expected format
    const transformedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      routeId: schedule.route_id,
      routeScheduleId: schedule.route_schedule_id,
      busId: schedule.bus_id,
      departureDate: schedule.departure_date,
      estimatedArrivalTime: schedule.estimated_arrival_time,
      actualDepartureTime: schedule.actual_departure_time,
      actualArrivalTime: schedule.actual_arrival_time,
      price: schedule.price,
      status: schedule.status,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at,
      route: schedule.routes ? {
        id: schedule.routes.id,
        name: schedule.routes.name,
        originId: schedule.routes.origin_id,
        destinationId: schedule.routes.destination_id,
        estimatedDuration: schedule.routes.estimated_duration,
      } : null,
    }));

    return NextResponse.json(transformedSchedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received schedule creation request:', body);

    const {
      routeId,
      routeScheduleId,
      departureTime,
      operatingDays,
      startDate,
      endDate,
      price,
      status = 'scheduled'
    } = body;

    // Get the route for estimated duration
    const route = await prisma.routes.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      return NextResponse.json(
        { error: "Route not found" },
        { status: 404 }
      );
    }

    // Parse dates
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    // Parse time
    const [hours, minutes] = departureTime.split(':').map(Number);

    // Generate schedules for each day in the range
    const schedulesToCreate = [];
    let currentDate = start;

    while (currentDate <= end) {
      const dayOfWeek = format(currentDate, 'EEEE').toLowerCase();
      
      // Only create schedule if it's an operating day
      if (operatingDays.includes(dayOfWeek)) {
        // Set departure time
        const departureDateTime = setMinutes(setHours(currentDate, hours), minutes);
        
        // Calculate estimated arrival time based on route duration
        const estimatedArrivalTime = addDays(departureDateTime, 0);
        estimatedArrivalTime.setMinutes(estimatedArrivalTime.getMinutes() + route.estimated_duration);

        schedulesToCreate.push({
          route_id: routeId,
          route_schedule_id: routeScheduleId,
          departure_date: departureDateTime,
          estimated_arrival_time: estimatedArrivalTime,
          price: price,
          status: status,
        });
      }
      
      // Move to next day
      currentDate = addDays(currentDate, 1);
    }

    console.log('Creating schedules:', schedulesToCreate);

    // Create all schedules
    const createdSchedules = await prisma.schedules.createMany({
      data: schedulesToCreate,
    });

    return NextResponse.json({
      message: "Schedules created successfully",
      count: createdSchedules.count,
    });

  } catch (error) {
    console.error("Error creating schedules:", error);
    return NextResponse.json(
      { 
        error: "Failed to create schedules",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 