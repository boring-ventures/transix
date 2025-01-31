import { NextResponse } from "next/server";
import { db } from "@/db";
import { busSeats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSeatSchema = z.object({
  status: z.enum(["available", "maintenance"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = updateSeatSchema.parse(body);

    const [updatedSeat] = await db
      .update(busSeats)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(busSeats.id, params.id))
      .returning();

    if (!updatedSeat) {
      return NextResponse.json(
        { error: "Asiento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSeat);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error inesperado al actualizar el asiento" },
      { status: 500 }
    );
  }
} 