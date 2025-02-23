import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el viaje existe
    const schedule = await prisma.schedules.findUnique({
      where: { id: params.id },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Viaje no encontrado" },
        { status: 404 }
      );
    }

    // Obtener la lista de pasajeros
    const passengers = await prisma.passenger_lists.findMany({
      where: {
        schedule_id: params.id,
      },
      orderBy: {
        seat_number: 'asc',
      },
    });

    // Transformar los datos al formato esperado
    const transformedPassengers = passengers.map(passenger => ({
      id: passenger.id,
      scheduleId: passenger.schedule_id,
      documentId: passenger.document_id,
      fullName: passenger.full_name,
      seatNumber: passenger.seat_number,
      status: passenger.status,
      createdAt: passenger.created_at,
      updatedAt: passenger.updated_at,
    }));

    return NextResponse.json(transformedPassengers);
  } catch (error) {
    console.error("Error fetching passenger list:", error);
    return NextResponse.json(
      { error: "Error al obtener la lista de pasajeros" },
      { status: 500 }
    );
  }
}

// Este endpoint se usará para actualizar el estado de los pasajeros (confirmed, cancelled, no_show)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { passengerId, status } = body;

    const updatedPassenger = await prisma.passenger_lists.update({
      where: { id: passengerId },
      data: { status },
    });

    return NextResponse.json({
      id: updatedPassenger.id,
      scheduleId: updatedPassenger.schedule_id,
      documentId: updatedPassenger.document_id,
      fullName: updatedPassenger.full_name,
      seatNumber: updatedPassenger.seat_number,
      status: updatedPassenger.status,
      createdAt: updatedPassenger.created_at,
      updatedAt: updatedPassenger.updated_at,
    });
  } catch (error) {
    console.error("Error updating passenger status:", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado del pasajero" },
      { status: 500 }
    );
  }
} 