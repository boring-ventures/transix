import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { scheduleId: string } }
) {
  try {
    const scheduleId = params.scheduleId;

    const passengers = await prisma.passenger_lists.findMany({
      where: {
        schedule_id: scheduleId,
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    // Transform the data to match the expected format
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
    console.error("Error fetching passengers:", error);
    return NextResponse.json(
      { error: "Error al obtener la lista de pasajeros" },
      { status: 500 }
    );
  }
} 