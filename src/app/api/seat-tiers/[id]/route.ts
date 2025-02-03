import { NextResponse } from "next/server";
import { db } from "@/db";
import { seatTiers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateSeatTierSchema } from "@/types/bus.types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateSeatTierSchema.parse(body);

    const [updatedTier] = await db
      .update(seatTiers)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        basePrice: validatedData.basePrice,
        isActive: validatedData.isActive,
        updatedAt: new Date(),
      })
      .where(eq(seatTiers.id, params.id))
      .returning();

    if (!updatedTier) {
      return NextResponse.json(
        { error: "Tipo de asiento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTier);
  } catch (error) {
    console.error("Error updating seat tier:", error);
    return NextResponse.json(
      { error: "Error al actualizar el tipo de asiento" },
      { status: 500 }
    );
  }
} 