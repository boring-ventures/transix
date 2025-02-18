import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBusSeatSchema } from "@/types/bus.types";
import { Prisma } from "@prisma/client";

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

    const seats = await prisma.bus_seats.findMany({
      where: { bus_id: busId },
      orderBy: { seat_number: 'asc' },
      include: {
        seat_tiers: true
      }
    });

    // Transform the response to match the expected format
    const transformedSeats = seats.map(seat => ({
      id: seat.id,
      busId: seat.bus_id,
      seatNumber: seat.seat_number,
      status: seat.status,
      isActive: seat.is_active,
      createdAt: seat.created_at,
      updatedAt: seat.updated_at,
      tier: seat.seat_tiers ? {
        id: seat.seat_tiers.id,
        name: seat.seat_tiers.name,
        basePrice: seat.seat_tiers.base_price,
      } : null
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { seatIds, data } = body;

    // Validate the input data
    const validatedData = updateBusSeatSchema.partial().parse(data);

    // Transform the data to match Prisma schema
    const dataToUpdate: Prisma.bus_seatsUpdateInput = {
      updated_at: new Date(),
    };

    if (validatedData.status !== undefined) {
      dataToUpdate.status = validatedData.status;
    }
    if (validatedData.isActive !== undefined) {
      dataToUpdate.is_active = validatedData.isActive;
    }
    if (validatedData.tierId !== undefined) {
      dataToUpdate.seat_tiers = { connect: { id: validatedData.tierId } };
    }

    // Update multiple seats
    const updatedSeats = await prisma.$transaction(
      seatIds.map((seatId: string) =>
        prisma.bus_seats.update({
          where: { id: seatId },
          data: dataToUpdate,
          include: {
            seat_tiers: true
          }
        })
      )
    );

    if (!updatedSeats.length) {
      return NextResponse.json(
        { error: "No se encontraron asientos para actualizar" },
        { status: 404 }
      );
    }

    // Transform the response to match the expected format
    const transformedSeats = updatedSeats.map(seat => ({
      id: seat.id,
      busId: seat.bus_id,
      seatNumber: seat.seat_number,
      status: seat.status,
      isActive: seat.is_active,
      createdAt: seat.created_at,
      updatedAt: seat.updated_at,
      tier: seat.seat_tiers ? {
        id: seat.seat_tiers.id,
        name: seat.seat_tiers.name,
        basePrice: seat.seat_tiers.base_price,
      } : null
    }));

    return NextResponse.json(transformedSeats);
  } catch (error) {
    console.error("Error updating bus seats:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Error al actualizar los asientos: " + error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar los asientos" },
      { status: 500 }
    );
  }
} 