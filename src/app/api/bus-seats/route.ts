import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { busSeats } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { updateBusSeatSchema } from "@/types/bus.types";

const bulkUpdateSchema = z.object({
  seatIds: z.array(z.string().uuid()),
  data: updateBusSeatSchema.partial(),
});

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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { seatIds, data } = bulkUpdateSchema.parse(body);

    const updatedSeats = await db
      .update(busSeats)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(inArray(busSeats.id, seatIds))
      .returning();

    if (!updatedSeats.length) {
      return NextResponse.json(
        { error: "No se encontraron asientos para actualizar" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSeats);
  } catch (error) {
    console.error("Error updating bus seats:", error);
    return NextResponse.json(
      { error: "Error al actualizar los asientos" },
      { status: 500 }
    );
  }
} 