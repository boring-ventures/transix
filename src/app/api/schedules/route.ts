import { NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, routes, buses, locations } from "@/db/schema";
import { sql } from "drizzle-orm";
import { isBusAvailable } from "@/lib/routes/validation";
import { createSchedule } from "@/lib/routes/routes";

export async function GET() {
  try {
    const allSchedules = await db.execute(sql`
      SELECT 
        s.id,
        s.route_id,
        s.bus_id,
        r.name as route_name,
        b.plate_number,
        o.name as origin_name,
        d.name as destination_name
      FROM ${schedules} s
      LEFT JOIN ${routes} r ON s.route_id = r.id
      LEFT JOIN ${buses} b ON s.bus_id = b.id
      LEFT JOIN ${locations} o ON r.origin_id = o.id
      LEFT JOIN ${locations} d ON r.destination_id = d.id
    `);

    return NextResponse.json(allSchedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Error al obtener los horarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { routeId, busId, departureDate, departureTime, arrivalTime, price } = body;

    // Check bus availability with both departure and arrival times
    const isAvailable = await isBusAvailable(
      busId,
      new Date(departureDate),
      departureTime,
      arrivalTime,
      undefined
    );

    if (!isAvailable) {
      return NextResponse.json(
        { 
          error: "Bus no disponible",
          details: "El bus ya está asignado a otra ruta en este horario. Por favor seleccione otro bus u horario."
        },
        { status: 409 }
      );
    }

    const schedule = await createSchedule(
      routeId,
      busId,
      new Date(departureDate),
      departureTime,
      price
    );

    return NextResponse.json(schedule);
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