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

export async function GET(request: Request) {
  // Se consulta la tabla de tickets uniendo las relaciones necesarias
  const tickets = await prismaClient.tickets.findMany({
    include: {
      schedules: {
        include: {
          routes: {
            include: {
              locations_routes_origin_idTolocations: true,
              locations_routes_destination_idTolocations: true,
            },
          },
        },
      },
      bus_seats: {
        include: {
          seat_tiers: true,
        },
      },
      customers: true,
    },
  });

  const formattedTickets = tickets.map((ticket) => {
    const schedule = ticket.schedules;
    const route = schedule?.routes;
    const origin = route?.locations_routes_origin_idTolocations;
    const destination = route?.locations_routes_destination_idTolocations;

    // Se formatea la fecha y hora de salida si existe un schedule
    const departureDate = schedule
      ? new Date(schedule.departure_date).toISOString().split("T")[0]
      : "";
    const departureTime = schedule
      ? new Date(schedule.departure_date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    // Se mapea el estado. En este ejemplo se asume que "active" → "confirmed"
    let status: "pending" | "confirmed" | "cancelled" | "completed" = "pending";
    if (ticket.status === "active") {
      status = "confirmed";
    } else if (ticket.status === "cancelled") {
      status = "cancelled";
    }

    return {
      id: ticket.id,
      routeId: route?.id || "",
      scheduleId: schedule?.id || "",
      seatNumber: ticket.bus_seats.seat_number,
      seatTier: ticket.bus_seats.seat_tiers.name,
      passengerName: ticket.customers?.full_name || "",
      passengerCI: ticket.customers?.document_id || "",
      price: Number(ticket.price),
      status: status,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      route: {
        name: route?.name || "",
        origin: origin?.name || "",
        destination: destination?.name || "",
      },
      schedule: {
        departureDate,
        departureTime,
      },
    };
  });

  return NextResponse.json(formattedTickets);
} 