import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { schedule_status_enum } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const routeId = searchParams.get("routeId");

    const schedules = await prisma.schedules.findMany({
      where: routeId ? {
        route_id: routeId,
      } : undefined,
      include: {
        routes: true,
        buses: {
          include: {
            bus_type_templates: true,
            bus_seats: true,
          },
        },
      },
      orderBy: [
        { departure_date: 'asc' },
        { estimated_arrival_time: 'asc' },
      ],
    });

    // Transform the data to match the expected format
    const transformedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      routeId: schedule.route_id,
      routeName: schedule.routes.name,
      busId: schedule.bus_id,
      bus: schedule.buses ? {
        id: schedule.buses.id,
        plateNumber: schedule.buses.plate_number,
        maintenanceStatus: schedule.buses.maintenance_status,
        template: schedule.buses.bus_type_templates ? {
          id: schedule.buses.bus_type_templates.id,
          name: schedule.buses.bus_type_templates.name,
          type: schedule.buses.bus_type_templates.type,
          totalCapacity: schedule.buses.bus_type_templates.total_capacity,
          seatsLayout: schedule.buses.bus_type_templates.seats_layout,
        } : null,
        seats: schedule.buses.bus_seats.map(seat => seat.seat_number),
      } : null,
      departureDate: schedule.departure_date,
      estimatedArrivalTime: schedule.estimated_arrival_time,
      price: schedule.price,
      status: schedule.status,
    }));

    return NextResponse.json(transformedSchedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Error fetching schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      routeId, 
      busId, 
      departureDate, 
      departureTime, 
      arrivalTime, 
      price,
      routeScheduleId
    } = body;

    // Check bus availability
    const overlappingSchedules = await prisma.schedules.findMany({
      where: {
        bus_id: busId,
        departure_date: new Date(departureDate),
        OR: [
          {
            AND: [
              { actual_departure_time: { lte: new Date(`${departureDate}T${arrivalTime}`) } },
              { actual_arrival_time: { gte: new Date(`${departureDate}T${departureTime}`) } },
            ],
          },
          {
            AND: [
              { estimated_arrival_time: { gte: new Date(`${departureDate}T${departureTime}`) } },
              { departure_date: { lte: new Date(`${departureDate}T${arrivalTime}`) } },
            ],
          },
        ],
        NOT: {
          status: {
            in: ['cancelled', 'completed'],
          },
        },
      },
    });

    if (overlappingSchedules.length > 0) {
      return NextResponse.json(
        { 
          error: "Bus no disponible",
          details: "El bus ya está asignado a otra ruta en este horario. Por favor seleccione otro bus u horario."
        },
        { status: 409 }
      );
    }

    // Create the schedule
    const schedule = await prisma.schedules.create({
      data: {
        route_id: routeId,
        route_schedule_id: routeScheduleId,
        bus_id: busId,
        departure_date: new Date(departureDate),
        estimated_arrival_time: new Date(`${departureDate}T${arrivalTime}`),
        price: price,
        status: schedule_status_enum.scheduled,
      },
      include: {
        routes: true,
        buses: {
          include: {
            bus_type_templates: true,
            bus_seats: true,
          },
        },
      },
    });

    // Transform the response to match the expected format
    const transformedSchedule = {
      id: schedule.id,
      routeId: schedule.route_id,
      routeName: schedule.routes.name,
      busId: schedule.bus_id,
      bus: schedule.buses ? {
        id: schedule.buses.id,
        plateNumber: schedule.buses.plate_number,
        maintenanceStatus: schedule.buses.maintenance_status,
        template: schedule.buses.bus_type_templates ? {
          id: schedule.buses.bus_type_templates.id,
          name: schedule.buses.bus_type_templates.name,
          type: schedule.buses.bus_type_templates.type,
          totalCapacity: schedule.buses.bus_type_templates.total_capacity,
          seatsLayout: schedule.buses.bus_type_templates.seats_layout,
        } : null,
        seats: schedule.buses.bus_seats.map(seat => seat.seat_number),
      } : null,
      departureDate: schedule.departure_date,
      estimatedArrivalTime: schedule.estimated_arrival_time,
      price: schedule.price,
      status: schedule.status,
    };

    return NextResponse.json(transformedSchedule);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { 
        error: "Error al crear el horario",
        details: error instanceof Error ? error.message : "Error inesperado"
      },
      { status: 500 }
    );
  }
} 