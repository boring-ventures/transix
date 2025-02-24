import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;

    const passengers = await prisma.passenger_lists.findMany({
      where: {
        schedule_id: scheduleId,
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    // Transform the data to match the expected format
    const transformedPassengers = passengers.map((passenger: {
      id: string;
      schedule_id: string;
      document_id: string | null;
      full_name: string;
      seat_number: string;
      status: string;
      created_at: Date;
      updated_at: Date;
    }) => ({
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