import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBusSeatSchema } from "@/types/bus.types";
import { Prisma } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateBusSeatSchema.parse(body);

    // Transform the data to match Prisma schema
    const dataToUpdate: Prisma.bus_seatsUpdateInput = {
      updated_at: new Date(),
    };

    if (validatedData.busId !== undefined) {
      dataToUpdate.bus_id = validatedData.busId;
    }
    if (validatedData.seatNumber !== undefined) {
      dataToUpdate.seat_number = validatedData.seatNumber;
    }
    if (validatedData.status !== undefined) {
      dataToUpdate.status = validatedData.status;
    }
    if (validatedData.isActive !== undefined) {
      dataToUpdate.is_active = validatedData.isActive;
    }
    if (validatedData.tierId !== undefined) {
      dataToUpdate.tier_id = validatedData.tierId;
    }

    const updatedSeat = await prisma.bus_seats.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        seat_tiers: true
      }
    });

    // Transform the response to match the expected format
    const transformedSeat = {
      id: updatedSeat.id,
      busId: updatedSeat.bus_id,
      seatNumber: updatedSeat.seat_number,
      status: updatedSeat.status,
      isActive: updatedSeat.is_active,
      createdAt: updatedSeat.created_at,
      updatedAt: updatedSeat.updated_at,
      tier: updatedSeat.seat_tiers ? {
        id: updatedSeat.seat_tiers.id,
        name: updatedSeat.seat_tiers.name,
        basePrice: updatedSeat.seat_tiers.base_price,
      } : null
    };

    return NextResponse.json(transformedSeat);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: "Asiento no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Error al actualizar el asiento: " + error.message },
        { status: 400 }
      );
    }
    console.error("Error updating bus seat:", error);
    return NextResponse.json(
      { error: "Error al actualizar el asiento" },
      { status: 500 }
    );
  }
} 