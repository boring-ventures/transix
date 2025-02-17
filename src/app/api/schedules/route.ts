import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { schedule_status_enum, maintenance_status_enum, Prisma } from "@prisma/client";
import { Route, RouteSchedule } from "@/types/route.types";

// Mapa de días de la semana para la conversión
const WEEKDAY_MAP: { [key: string]: string } = {
  'Sunday': 'sunday',
  'Monday': 'monday',
  'Tuesday': 'tuesday',
  'Wednesday': 'wednesday',
  'Thursday': 'thursday',
  'Friday': 'friday',
  'Saturday': 'saturday'
};

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
        maintenanceStatus: schedule.buses.maintenance_status_enum,
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
      price: Number(schedule.price),
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
      routeScheduleId,
      startDate,
      endDate,
      price = 0
    } = body;

    if (!routeId || !routeScheduleId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Obtener el horario recurrente y la ruta
    const routeSchedule = await prisma.route_schedules.findUnique({
      where: { id: routeScheduleId },
      include: { routes: true }
    });

    if (!routeSchedule) {
      return NextResponse.json(
        { error: "Horario recurrente no encontrado" },
        { status: 404 }
      );
    }

    // Generar los horarios para cada día dentro del rango
    const start = new Date(startDate);
    const end = new Date(endDate);
    const schedules = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // Obtener el día de la semana en formato correcto
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dayOfWeek = WEEKDAY_MAP[dayName];
      
      if (routeSchedule.operating_days.includes(dayOfWeek)) {
        // Crear fecha y hora de salida
        const departureDateTime = new Date(date);
        const departureTime = new Date(routeSchedule.departure_time);
        departureDateTime.setHours(
          departureTime.getHours(),
          departureTime.getMinutes(),
          0,
          0
        );

        // Calcular hora de llegada estimada
        const estimatedArrivalTime = new Date(departureDateTime);
        estimatedArrivalTime.setMinutes(
          estimatedArrivalTime.getMinutes() + routeSchedule.routes.estimated_duration
        );

        try {
          const scheduleData: Prisma.schedulesUncheckedCreateInput = {
            route_id: routeId,
            route_schedule_id: routeScheduleId,
            departure_date: departureDateTime,
            estimated_arrival_time: estimatedArrivalTime,
            price: price,
            status: schedule_status_enum.scheduled
          };

          const schedule = await prisma.schedules.create({
            data: scheduleData
          });
          schedules.push(schedule);
        } catch (createError) {
          console.error("Error creating individual schedule:", createError);
          continue;
        }
      }
    }

    if (schedules.length === 0) {
      return NextResponse.json(
        { error: "No se pudieron generar horarios para el rango de fechas especificado" },
        { status: 400 }
      );
    }

    // Transformar los horarios creados
    const transformedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      routeId: schedule.route_id,
      routeScheduleId: schedule.route_schedule_id,
      departureDate: schedule.departure_date,
      estimatedArrivalTime: schedule.estimated_arrival_time,
      price: Number(schedule.price),
      status: schedule.status,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at
    }));

    return NextResponse.json(transformedSchedules);
  } catch (error) {
    console.error("Error creating schedules:", error);
    return NextResponse.json(
      { 
        error: "Error al generar los horarios",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
} 