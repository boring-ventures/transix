import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBusSeatSchema } from "@/types/bus.types";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const seats = await prisma.bus_seats.findMany({
      where: { bus_id: id },
      orderBy: { seat_number: "asc" },
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

    const dataToUpdate: Record<string, any> = {};
    if (validatedData.busId !== undefined) {
      dataToUpdate.bus_id = validatedData.busId;
    }
    if (validatedData.seatNumber !== undefined) {
      dataToUpdate.seat_number = validatedData.seatNumber;
    }
    if (validatedData.tierId !== undefined) {
      dataToUpdate.tier_id = validatedData.tierId;
    }
    if (validatedData.status !== undefined) {
      dataToUpdate.status = validatedData.status;
    }
    if (validatedData.isActive !== undefined) {
      dataToUpdate.is_active = validatedData.isActive;
    }
    dataToUpdate.updated_at = new Date();

    const updatedSeat = await prisma.bus_seats.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedSeat);
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Asiento no encontrado" },
        { status: 404 }
      );
    }
    console.error("Error updating bus seat:", error);
    return NextResponse.json(
      { error: "Error al actualizar el asiento" },
      { status: 500 }
    );
  }
}