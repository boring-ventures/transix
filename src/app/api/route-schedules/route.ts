import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRouteScheduleSchema } from "@/types/route.types";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const routeId = searchParams.get("routeId");

    const schedules = await prisma.route_schedules.findMany({
      where: routeId ? {
        route_id: routeId,
      } : undefined,
      include: {
        routes: true,
        schedules: {
          include: {
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
          }
        }
      },
    });

    // Transform the data to match the expected format
    const transformedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      routeId: schedule.route_id,
      departureTime: schedule.departure_time.toTimeString().slice(0, 5),
      estimatedArrivalTime: schedule.estimated_arrival_time.toTimeString().slice(0, 5),
      operatingDays: schedule.operating_days,
      active: schedule.active,
      seasonStart: schedule.season_start,
      seasonEnd: schedule.season_end,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at,
      route: schedule.routes ? {
        id: schedule.routes.id,
        name: schedule.routes.name,
        originId: schedule.routes.origin_id,
        destinationId: schedule.routes.destination_id,
        estimatedDuration: schedule.routes.estimated_duration,
        active: schedule.routes.active,
        createdAt: schedule.routes.created_at,
        updatedAt: schedule.routes.updated_at,
      } : undefined,
      bus: schedule.schedules[0]?.bus_assignments[0]?.buses ? {
        id: schedule.schedules[0].bus_assignments[0].buses.id,
        plateNumber: schedule.schedules[0].bus_assignments[0].buses.plate_number,
        template: schedule.schedules[0].bus_assignments[0].buses.bus_type_templates ? {
          id: schedule.schedules[0].bus_assignments[0].buses.bus_type_templates.id,
          type: schedule.schedules[0].bus_assignments[0].buses.bus_type_templates.type,
          // Se usa el campo seat_template_matrix en lugar de seats_layout (que es null)
          seatsLayout: schedule.schedules[0].bus_assignments[0].buses.bus_type_templates.seat_template_matrix,
        } : undefined,
        seats: schedule.schedules[0].bus_assignments[0].buses.bus_seats.map(seat => ({
          id: seat.id,
          seatNumber: seat.seat_number,
          status: seat.status,
          tier: seat.seat_tiers ? {
            id: seat.seat_tiers.id,
            name: seat.seat_tiers.name,
            basePrice: seat.seat_tiers.base_price
          } : undefined
        })),
      } : undefined,
    }));

    return NextResponse.json(transformedSchedules);
  } catch (error) {
    console.error("Error fetching route schedules:", error);
    return NextResponse.json(
      { error: "Error al obtener los horarios de ruta" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createRouteScheduleSchema.parse(body);

    const schedule = await prisma.route_schedules.create({
      data: {
        route_id: validatedData.routeId,
        departure_time: new Date(`1970-01-01T${validatedData.departureTime}:00.000Z`),
        estimated_arrival_time: new Date(`1970-01-01T${validatedData.estimatedArrivalTime}:00.000Z`),
        operating_days: validatedData.operatingDays,
        season_start: validatedData.seasonStart,
        season_end: validatedData.seasonEnd,
        active: validatedData.active,
      },
      include: {
        routes: true,
      },
    });

    // Transform the response to match the expected format
    const transformedSchedule = {
      id: schedule.id,
      routeId: schedule.route_id,
      departureTime: schedule.departure_time.toTimeString().slice(0, 5),
      estimatedArrivalTime: schedule.estimated_arrival_time.toTimeString().slice(0, 5),
      operatingDays: schedule.operating_days,
      active: schedule.active,
      seasonStart: schedule.season_start,
      seasonEnd: schedule.season_end,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at,
      route: schedule.routes ? {
        id: schedule.routes.id,
        name: schedule.routes.name,
        originId: schedule.routes.origin_id,
        destinationId: schedule.routes.destination_id,
        estimatedDuration: schedule.routes.estimated_duration,
        active: schedule.routes.active,
        createdAt: schedule.routes.created_at,
        updatedAt: schedule.routes.updated_at,
      } : undefined,
    };

    return NextResponse.json(transformedSchedule, { status: 201 });
  } catch (error) {
    console.error("Error creating route schedule:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos de horario de ruta inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al crear el horario de ruta" },
      { status: 500 }
    );
  }
} 