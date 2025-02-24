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
    seatNumber: z.string(),
  }),
  notes: z.string().optional(),
});

const prismaClient = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { tickets } = await request.json();
    console.log(tickets);
    
    const createdTickets = await prismaClient.$transaction(async (prisma) => {
      // Crear los tickets sin la propiedad customerData
      const ticketsCreated = await Promise.all(
        tickets.map((ticket: any) => {
          const { customerData, ...ticketData } = ticket;
          return prisma.tickets.create({
            data: ticketData
          });
        })
      );
      
      // Extraer información de pasajeros usando exclusivamente customerData
      const passengerData = tickets.map((ticket: any) => ({
        schedule_id: ticket.schedule_id,
        full_name: ticket.customerData.fullName,
        document_id: ticket.customerData.documentId,
        seat_number: ticket.customerData.seatNumber,
        status: "confirmed"
      }));
      
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
    console.log('El error es: ', error);
    console.error("Error creating tickets:", error);
    return NextResponse.json(
      { error: "Error creating tickets", details: error.message },
      { status: 500 }
    );
  }
} 