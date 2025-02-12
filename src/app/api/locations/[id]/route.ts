import { db } from "@/db";
import { locations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateLocationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateLocationSchema.parse(body);

    const [location] = await db
      .update(locations)
      .set({
        name: validatedData.name,
        updatedAt: new Date(),
      })
      .where(eq(locations.id, params.id))
      .returning();

    if (!location) {
      return NextResponse.json(
        { error: "Ubicación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { error: "Error al actualizar ubicación" },
      { status: 500 }
    );
  }
} 