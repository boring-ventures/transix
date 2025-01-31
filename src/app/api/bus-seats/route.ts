import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { busSeats } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busId = searchParams.get("busId");

    if (!busId) {
      return NextResponse.json(
        { error: "ID del bus es requerido" },
        { status: 400 }
      );
    }

    const seats = await db.query.busSeats.findMany({
      where: eq(busSeats.busId, busId),
    });

    return NextResponse.json(seats);
  } catch (error) {
    console.error("Error fetching bus seats:", error);
    return NextResponse.json(
      { error: "Error al obtener los asientos del bus" },
      { status: 500 }
    );
  }
} 