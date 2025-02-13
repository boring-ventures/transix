import { NextResponse } from "next/server";
import { db } from "@/db";
import { busAssignments } from "@/db/schema";
import { z } from "zod";

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

    // Insertar usando el routeId recibido directamente
    await db.insert(busAssignments).values({
      id: crypto.randomUUID(),
      busId: validatedData.busId,
      routeId: validatedData.routeId, // Usar el routeId que viene del cliente
      scheduleId: crypto.randomUUID(),
      startTime: new Date(`${today}T${validatedData.startTime}`),
      endTime: new Date(`${today}T${validatedData.endTime}`),
      assignedAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating bus assignment:", error);
    return NextResponse.json(
      { error: "No se pudo asignar el bus a la ruta" },
      { status: 500 }
    );
  }
} 