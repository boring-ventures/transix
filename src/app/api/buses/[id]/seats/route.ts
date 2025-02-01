import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { busSeats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateBusSeatSchema } from "@/types/bus.types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    try {
      const { id } = await params;
    const seats = await db.query.busSeats.findMany({
      where: eq(busSeats.busId, id),
      orderBy: (seats, { asc }) => [asc(seats.seatNumber)],
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateBusSeatSchema.parse(body);

    const updatedSeat = await db
      .update(busSeats)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(busSeats.id, params.id))
      .returning();

    if (!updatedSeat.length) {
      return NextResponse.json(
        { error: "Asiento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSeat[0]);
  } catch (error) {
    console.error("Error updating bus seat:", error);
    return NextResponse.json(
      { error: "Error al actualizar el asiento" },
      { status: 500 }
    );
  }
} 