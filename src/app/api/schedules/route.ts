import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, format, parseISO, setHours, setMinutes } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const routeScheduleId = searchParams.get('routeScheduleId');

    const schedules = await prisma.schedules.findMany({
      where: {
        ...(routeScheduleId ? { route_schedule_id: routeScheduleId } : {}),
        status: 'scheduled', // Only show scheduled trips
      },
      include: {
        routes: true,
        route_schedules: true,
        buses: {
          include: {
            bus_type_templates: true,
            bus_seats: {
              include: {
                seat_tiers: true
              }
            }
          }
        },
        bus_assignments: {
          where: {
            status: 'active'
          },
          include: {
            buses: {
              include: {
                bus_type_templates: true,
                bus_seats: {
                  include: {
                    seat_tiers: true
                  }
                }
              }
            }
          }
        }
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
      busAssignments: schedule.bus_assignments.map(assignment => ({
        id: assignment.id,
        busId: assignment.bus_id,
        routeId: assignment.route_id,
        scheduleId: assignment.schedule_id,
        status: assignment.status,
        assignedAt: assignment.assigned_at,
        startTime: assignment.start_time,
        endTime: assignment.end_time,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
        bus: assignment.buses ? {
          id: assignment.buses.id,
          plateNumber: assignment.buses.plate_number,
          template: assignment.buses.bus_type_templates ? {
            id: assignment.buses.bus_type_templates.id,
            name: assignment.buses.bus_type_templates.name,
            type: assignment.buses.bus_type_templates.type,
            seatsLayout: assignment.buses.bus_type_templates.seats_layout,
            seatTemplateMatrix: assignment.buses.bus_type_templates.seat_template_matrix,
          } : undefined,
          seats: assignment.buses.bus_seats.map(seat => ({
            id: seat.id,
            seatNumber: seat.seat_number,
            status: seat.status,
            tier: seat.seat_tiers ? {
              id: seat.seat_tiers.id,
              name: seat.seat_tiers.name,
              basePrice: seat.seat_tiers.base_price,
            } : undefined
          }))
        } : undefined
      }))
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    // Verify the schedule exists and can be updated
    const existingSchedule = await prisma.schedules.findUnique({
      where: { id },
      include: {
        bus_assignments: true
      }
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    if (existingSchedule.status !== 'scheduled') {
      return NextResponse.json(
        { error: "Only scheduled trips can be modified" },
        { status: 400 }
      );
    }

    // Update the schedule
    const updatedSchedule = await prisma.schedules.update({
      where: { id },
      data: updateData,
      include: {
        routes: true,
        route_schedules: true,
        buses: {
          include: {
            bus_type_templates: true
          }
        },
        bus_assignments: {
          include: {
            buses: {
              include: {
                bus_type_templates: true
              }
            }
          }
        }
      }
    });

    // Transform the response
    const transformedSchedule = {
      id: updatedSchedule.id,
      routeId: updatedSchedule.route_id,
      routeScheduleId: updatedSchedule.route_schedule_id,
      busId: updatedSchedule.bus_id,
      departureDate: updatedSchedule.departure_date,
      estimatedArrivalTime: updatedSchedule.estimated_arrival_time,
      actualDepartureTime: updatedSchedule.actual_departure_time,
      actualArrivalTime: updatedSchedule.actual_arrival_time,
      price: updatedSchedule.price,
      status: updatedSchedule.status,
      createdAt: updatedSchedule.created_at,
      updatedAt: updatedSchedule.updated_at,
      busAssignments: updatedSchedule.bus_assignments.map(assignment => ({
        id: assignment.id,
        busId: assignment.bus_id,
        routeId: assignment.route_id,
        scheduleId: assignment.schedule_id,
        status: assignment.status,
        assignedAt: assignment.assigned_at,
        startTime: assignment.start_time,
        endTime: assignment.end_time,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
        bus: assignment.buses ? {
          id: assignment.buses.id,
          plateNumber: assignment.buses.plate_number,
          template: assignment.buses.bus_type_templates ? {
            id: assignment.buses.bus_type_templates.id,
            name: assignment.buses.bus_type_templates.name,
            type: assignment.buses.bus_type_templates.type,
            seatsLayout: assignment.buses.bus_type_templates.seats_layout,
            seatTemplateMatrix: assignment.buses.bus_type_templates.seat_template_matrix,
          } : undefined,
          seats: assignment.buses.bus_seats.map(seat => ({
            id: seat.id,
            seatNumber: seat.seat_number,
            status: seat.status,
            tier: seat.seat_tiers ? {
              id: seat.seat_tiers.id,
              name: seat.seat_tiers.name,
              basePrice: seat.seat_tiers.base_price,
            } : undefined
          }))
        } : undefined
      }))
    };

    return NextResponse.json(transformedSchedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { 
        error: "Failed to update schedule",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    // Verify the schedule exists and check all its dependencies
    const existingSchedule = await prisma.schedules.findUnique({
      where: { id },
      include: {
        bus_assignments: true,
        tickets: true,
        parcels: true,
        bus_logs: true,
        occupancy_logs: true
      }
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Check schedule status
    if (existingSchedule.status !== 'scheduled') {
      return NextResponse.json(
        { error: "Only scheduled trips can be deleted" },
        { status: 400 }
      );
    }

    // Check for active dependencies
    const dependencies = {
      busAssignments: existingSchedule.bus_assignments.length > 0,
      tickets: existingSchedule.tickets.length > 0,
      parcels: existingSchedule.parcels.length > 0,
      busLogs: existingSchedule.bus_logs.length > 0,
      occupancyLogs: existingSchedule.occupancy_logs.length > 0
    };

    if (Object.values(dependencies).some(Boolean)) {
      return NextResponse.json(
        { 
          error: "Cannot delete schedule with existing dependencies",
          details: {
            message: "El viaje tiene registros relacionados que impiden su eliminación",
            dependencies: Object.entries(dependencies)
              .filter(([, hasRecords]) => hasRecords)
              .map(([type]) => type)
          }
        },
        { status: 400 }
      );
    }

    // If we reach this point, it's safe to delete
    await prisma.schedules.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Schedule deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete schedule",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 