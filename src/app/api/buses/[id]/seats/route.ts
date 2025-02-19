import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBusSeatSchema } from "@/types/bus.types";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const seats = await prisma.bus_seats.findMany({
      where: { bus_id: id },
      orderBy: { seat_number: "asc" },
      include: {
        seat_tiers: true,
      },
    });

    const transformedSeats = seats.map((seat) => ({
      id: seat.id,
      busId: seat.bus_id,
      seatNumber: seat.seat_number,
      status: seat.status,
      isActive: seat.is_active,
      createdAt: seat.created_at,
      updatedAt: seat.updated_at,
      tier: seat.seat_tiers
        ? {
            id: seat.seat_tiers.id,
            name: seat.seat_tiers.name,
            basePrice: seat.seat_tiers.base_price,
          }
        : null,
    }));

    return NextResponse.json(transformedSeats);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const validatedData = updateBusSeatSchema.parse(body);

    const dataToUpdate: Prisma.bus_seatsUpdateInput = {
      updated_at: new Date(),
    };

    if (validatedData.busId !== undefined) {
      dataToUpdate.buses = { connect: { id: validatedData.busId } };
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
      dataToUpdate.seat_tiers = { connect: { id: validatedData.tierId } };
    }

    const updatedSeat = await prisma.bus_seats.update({
      where: { id },
      data: dataToUpdate,
      include: {
        seat_tiers: true,
      },
    });

    const transformedSeat = {
      id: updatedSeat.id,
      busId: updatedSeat.bus_id,
      seatNumber: updatedSeat.seat_number,
      status: updatedSeat.status,
      isActive: updatedSeat.is_active,
      createdAt: updatedSeat.created_at,
      updatedAt: updatedSeat.updated_at,
      tier: updatedSeat.seat_tiers
        ? {
            id: updatedSeat.seat_tiers.id,
            name: updatedSeat.seat_tiers.name,
            basePrice: updatedSeat.seat_tiers.base_price,
          }
        : null,
    };

    return NextResponse.json(transformedSeat);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
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