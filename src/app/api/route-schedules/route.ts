import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { routeSchedules } from "@/db/schema";
import { createRouteScheduleSchema } from "@/types/route.types";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const routeId = searchParams.get("routeId");

    const query = routeId
      ? db.select().from(routeSchedules).where(eq(routeSchedules.routeId, routeId))
      : db.select().from(routeSchedules);

    const schedules = await query;
    return NextResponse.json(schedules);
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

    const scheduleData = {
      routeId: validatedData.routeId,
      departureTime: validatedData.departureTime,
      operatingDays: validatedData.operatingDays,
      seasonStart: validatedData.seasonStart.toISOString().split('T')[0],
      seasonEnd: validatedData.seasonEnd.toISOString().split('T')[0],
      active: validatedData.active,
    };

    const [newSchedule] = await db
      .insert(routeSchedules)
      .values(scheduleData)
      .returning();

    return NextResponse.json(newSchedule, { status: 201 });
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