import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { bus_assignment_status_enum } from "@prisma/client";

const createAssignmentSchema = z.object({
  busId: z.string().uuid("ID de bus inválido"),
  routeId: z.string().uuid("ID de ruta inválido"),
  scheduleId: z.string().uuid("ID de horario inválido"),
  startTime: z.string().datetime("Formato de fecha y hora inválido"),
  endTime: z.string().datetime("Formato de fecha y hora inválido"),
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
    
    // Verificar que el bus existe y está activo
    const bus = await prisma.buses.findUnique({
      where: { 
        id: validatedData.busId,
        is_active: true,
        maintenance_status_enum: 'active'
      }
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus no encontrado o no está disponible" },
        { status: 404 }
      );
    }

    // Verificar que la ruta existe y está activa
    const route = await prisma.routes.findUnique({
      where: { 
        id: validatedData.routeId,
        active: true
      }
    });

    if (!route) {
      return NextResponse.json(
        { error: "Ruta no encontrada o no está activa" },
        { status: 404 }
      );
    }

    // Verificar que el schedule existe y está en estado 'scheduled'
    const schedule = await prisma.schedules.findUnique({
      where: { 
        id: validatedData.scheduleId,
        status: 'scheduled'
      }
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Horario no encontrado o no está disponible para asignación" },
        { status: 404 }
      );
    }

    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);

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
        buses: {
          include: {
            bus_type_templates: true
          }
        },
        routes: true,
      },
    });

    // Actualizar el precio del schedule basado en el tipo de bus
    if (assignment.buses.bus_type_templates) {
      const basePrice = 50; // TODO: Obtener el precio base de la configuración
      const multiplier = assignment.buses.bus_type_templates.type === 'luxury' ? 1.5 : 1;
      
      await prisma.schedules.update({
        where: { id: validatedData.scheduleId },
        data: {
          price: basePrice * multiplier,
          bus_id: validatedData.busId // Asignar el bus al schedule
        }
      });
    }

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
        maintenanceStatus: assignment.buses.maintenance_status_enum,
        template: assignment.buses.bus_type_templates ? {
          id: assignment.buses.bus_type_templates.id,
          name: assignment.buses.bus_type_templates.name,
          type: assignment.buses.bus_type_templates.type
        } : undefined
      } : null,
      route: assignment.routes ? {
        id: assignment.routes.id,
        name: assignment.routes.name,
      } : null,
    };

    return NextResponse.json(transformedAssignment);
  } catch (error) {
    console.error("Error creating bus assignment:", error);
    return NextResponse.json(
      { 
        error: "Error al asignar bus",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
} 