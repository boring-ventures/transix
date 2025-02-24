import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const createTicketSchema = z.object({
  scheduleId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  busSeatId: z.string().uuid(),
  price: z.number(),
  customerData: z.object({
    fullName: z.string(),
    documentId: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }),
  notes: z.string().optional(),
});

const prismaClient = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { tickets } = await request.json();
    
    const createdTickets = await prismaClient.$transaction(async (prisma) => {
      // Crear los tickets
      const ticketsCreated = await Promise.all(
        tickets.map((ticket: any) =>
          prisma.tickets.create({
            data: ticket
          })
        )
      );

      // Extraer información de pasajeros de las notas
      const passengerData = tickets.map((ticket: any) => {
        const noteMatch = ticket.notes.match(/Pasajero: (.*?), Documento: (.*?)$/);
        return {
          schedule_id: ticket.schedule_id,
          full_name: noteMatch ? noteMatch[1] : "Sin nombre",
          document_id: noteMatch ? noteMatch[2] : null,
          seat_number: ticket.bus_seat_id,
          status: "confirmed"
        };
      });

      // Crear registros en passenger_lists
      await Promise.all(
        passengerData.map((passenger: any) =>
          prisma.passenger_lists.create({
            data: passenger
          })
        )
      );

      return ticketsCreated;
    });

    return NextResponse.json(createdTickets);
  } catch (error: any) {
    console.error("Error creating tickets:", error);
    return NextResponse.json(
      { error: "Error creating tickets", details: error.message },
      { status: 500 }
    );
  }
} 