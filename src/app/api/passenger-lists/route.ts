import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Obtener todas las listas de pasajeros agrupadas por schedule_id
    const passengerLists = await prisma.passenger_lists.findMany({
      select: {
        schedule_id: true,
      },
      distinct: ['schedule_id'],
    });

    // Transformar los resultados a un formato más simple
    const scheduleIds = passengerLists.map(list => ({
      schedule_id: list.schedule_id
    }));

    return NextResponse.json(scheduleIds);
  } catch (error) {
    console.error('Error fetching passenger lists:', error);
    return NextResponse.json([], { status: 500 });
  }
} 