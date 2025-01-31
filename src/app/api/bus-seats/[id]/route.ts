import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { busSeats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateBusSeatSchema } from "@/types/bus.types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    const body = await request.json();
    const validatedData = updateBusSeatSchema.parse(body);

    const updatedSeat = await db
      .update(busSeats)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(busSeats.id, id))
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