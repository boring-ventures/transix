import { NextResponse } from "next/server";
import { db } from "@/db";
import { busSeats } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const seats = await db
      .select()
      .from(busSeats)
      .where(eq(busSeats.busId, params.id));

    return NextResponse.json(seats);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al obtener los asientos";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 