import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { bus_assignment_status_enum } from "@prisma/client";
import { Prisma } from "@prisma/client";

const createAssignmentSchema = z.object({
  busId: z.string().uuid("ID de bus inválido"),
  routeId: z.string().uuid("ID de ruta inválido"),
  scheduleId: z.string().uuid("ID de horario inválido"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
});

export async function GET() {
  try {
    const assignments = await prisma.bus_assignments.findMany({
      where: {
        status: bus_assignment_status_enum.active,
      },
      include: {
        buses: true,
        routes: true,
      },
    });

    const transformedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      busId: assignment.bus_id,
      routeId: assignment.route_id,
      scheduleId: assignment.schedule_id,
      startTime: assignment.start_time,
      endTime: assignment.end_time,
      assignedAt: assignment.assigned_at,
      status: assignment.status,
      bus: assignment.buses ? {
        id: assignment.buses.id,
        plateNumber: assignment.buses.plate_number,
        maintenanceStatus: assignment.buses.maintenance_status_enum,
      } : null,
      route: assignment.routes ? {
        id: assignment.routes.id,
        name: assignment.routes.name,
      } : null,
    }));

    return NextResponse.json(transformedAssignments);
  } catch (error) {
    console.error("Error fetching bus assignments:", error);
    return NextResponse.json(
      { error: "Error al obtener asignaciones de buses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body:", body);

    // Validar datos de entrada
    const validatedData = createAssignmentSchema.parse(body);
    
    // Verificar que el bus existe
    const bus = await prisma.buses.findUnique({
      where: { id: validatedData.busId }
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la ruta existe
    const route = await prisma.routes.findUnique({
      where: { id: validatedData.routeId }
    });

    if (!route) {
      return NextResponse.json(
        { error: "Ruta no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el schedule existe
    const schedule = await prisma.schedules.findUnique({
      where: { id: validatedData.scheduleId }
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Horario no encontrado" },
        { status: 404 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const startTime = new Date(`${today}T${validatedData.startTime}:00Z`);
    const endTime = new Date(`${today}T${validatedData.endTime}:00Z`);

    // Verificar que la hora de fin es posterior a la hora de inicio
    if (endTime <= startTime) {
      return NextResponse.json(
        { 
          error: "Horario inválido",
          details: "La hora de fin debe ser posterior a la hora de inicio"
        },
        { status: 400 }
      );
    }

    // Verificar si ya existe una asignación activa para este bus en este horario
    const existingAssignment = await prisma.bus_assignments.findFirst({
      where: {
        bus_id: validatedData.busId,
        status: bus_assignment_status_enum.active,
        OR: [
          {
            AND: [
              { start_time: { lte: endTime } },
              { end_time: { gte: startTime } }
            ]
          }
        ]
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { 
          error: "Conflicto de horario",
          details: "El bus ya está asignado durante este horario"
        },
        { status: 409 }
      );
    }

    // Crear la asignación
    const assignment = await prisma.bus_assignments.create({
      data: {
        bus_id: validatedData.busId,
        route_id: validatedData.routeId,
        schedule_id: validatedData.scheduleId,
        start_time: startTime,
        end_time: endTime,
        assigned_at: new Date(),
        status: bus_assignment_status_enum.active,
      },
      include: {
        buses: true,
        routes: true,
      },
    });

    // Transformar la respuesta
    const transformedAssignment = {
      id: assignment.id,
      busId: assignment.bus_id,
      routeId: assignment.route_id,
      scheduleId: assignment.schedule_id,
      startTime: assignment.start_time,
      endTime: assignment.end_time,
      assignedAt: assignment.assigned_at,
      status: assignment.status,
      bus: assignment.buses ? {
        id: assignment.buses.id,
        plateNumber: assignment.buses.plate_number,
        maintenanceStatus: assignment.buses.maintenance_status_enum || 'active',
      } : null,
      route: assignment.routes ? {
        id: assignment.routes.id,
        name: assignment.routes.name,
      } : null,
    };

    return NextResponse.json(transformedAssignment);
  } catch (error) {
    console.error("Error creating bus assignment:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Datos de asignación inválidos",
          details: error.errors
        },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      let errorMessage = "Error de base de datos";
      let statusCode = 400;

      switch (error.code) {
        case 'P2002':
          errorMessage = "Ya existe una asignación con estos datos";
          break;
        case 'P2003':
          errorMessage = "El bus o la ruta no existen";
          statusCode = 404;
          break;
        case 'P2025':
          errorMessage = "No se encontró el registro a actualizar";
          statusCode = 404;
          break;
        default:
          errorMessage = "Error en la base de datos";
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.message,
          code: error.code
        },
        { status: statusCode }
      );
    }

    // Para cualquier otro tipo de error, devolver un error 500 con un mensaje genérico
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
} 