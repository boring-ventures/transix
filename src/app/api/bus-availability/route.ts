import { NextResponse } from "next/server";
import { db } from "@/db";
import { busAssignments } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busId = searchParams.get("busId");
    const departureDate = searchParams.get("departureDate");
    const departureTime = searchParams.get("departureTime");
    const arrivalTime = searchParams.get("arrivalTime");

    if (!busId || !departureDate || !departureTime || !arrivalTime) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Convertir la fecha a formato ISO
    const date = new Date(departureDate).toISOString().split('T')[0];
    
    // Consulta corregida
    const existingAssignments = await db
      .select()
      .from(busAssignments)
      .where(
        and(
          eq(busAssignments.busId, busId),
          sql`DATE(${busAssignments.startTime}) = ${date}::date`,
          sql`${busAssignments.startTime}::time <= ${arrivalTime}::time`,
          sql`${busAssignments.endTime}::time >= ${departureTime}::time`
        )
      );

    return NextResponse.json({
      isAvailable: existingAssignments.length === 0,
    });
  } catch (error) {
    console.error("Error checking bus availability:", error);
    return NextResponse.json(
      { error: "Error checking bus availability" },
      { status: 500 }
    );
  }
} 