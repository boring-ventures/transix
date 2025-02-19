import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateSeatTierSchema } from "@/types/bus.types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSeatTierSchema.parse(body);

    const updatedTier = await prisma.seat_tiers.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        base_price: validatedData.basePrice,
        is_active: validatedData.isActive,
        updated_at: new Date(),
      },
    });

    if (!updatedTier) {
      return NextResponse.json(
        { error: "Tipo de asiento no encontrado" },
        { status: 404 }
      );
    }

    // Transform the response to match the expected format
    const transformedTier = {
      id: updatedTier.id,
      name: updatedTier.name,
      description: updatedTier.description,
      basePrice: updatedTier.base_price,
      isActive: updatedTier.is_active,
      companyId: updatedTier.company_id,
      createdAt: updatedTier.created_at,
      updatedAt: updatedTier.updated_at,
    };

    return NextResponse.json(transformedTier);
  } catch (error) {
    console.error("Error updating seat tier:", error);
    return NextResponse.json(
      { error: "Error al actualizar el tipo de asiento" },
      { status: 500 }
    );
  }
} 