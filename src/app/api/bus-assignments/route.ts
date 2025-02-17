import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { bus_assignment_status_enum } from "@prisma/client";

const createAssignmentSchema = z.object({
  busId: z.string().uuid(),
  routeId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body:", body);

    const validatedData = createAssignmentSchema.parse(body);
    const today = new Date().toISOString().split('T')[0];

    const assignment = await prisma.bus_assignments.create({
      data: {
        bus_id: validatedData.busId,
        route_id: validatedData.routeId,
        schedule_id: crypto.randomUUID(),
        start_time: new Date(`${today}T${validatedData.startTime}`),
        end_time: new Date(`${today}T${validatedData.endTime}`),
        assigned_at: new Date(),
        status: bus_assignment_status_enum.active,
      },
      include: {
        buses: true,
        routes: true,
      },
    });

    // Transform the response to match the expected format
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
        maintenanceStatus: assignment.buses.maintenance_status,
      } : null,
      route: assignment.routes ? {
        id: assignment.routes.id,
        name: assignment.routes.name,
      } : null,
    };

    return NextResponse.json(transformedAssignment, { status: 201 });
  } catch (error) {
    console.error("Error creating bus assignment:", error);
    return NextResponse.json(
      { error: "No se pudo asignar el bus a la ruta" },
      { status: 500 }
    );
  }
} 