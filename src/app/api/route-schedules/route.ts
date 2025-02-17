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
      },
    });

    // Transform the data to match the expected format
    const transformedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      routeId: schedule.route_id,
      departureTime: schedule.departure_time.toTimeString().slice(0, 5),
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