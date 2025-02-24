import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import type { ticket_status_enum } from "@prisma/client";

interface TicketInput {
  schedule_id: string;
  customer_id: string;
  bus_seat_id: string;
  price: number;
  status: ticket_status_enum;
  customerData: {
    fullName: string;
    documentId: string;
    seatNumber: string;
  };
}

const prismaClient = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { tickets } = await request.json() as { tickets: TicketInput[] };
    
    const createdTickets = await prismaClient.$transaction(async (tx) => {
      // Create tickets
      const ticketsCreated = await Promise.all(
        tickets.map((ticket) => {
          return tx.tickets.create({
            data: {
              schedule_id: ticket.schedule_id,
              customer_id: ticket.customer_id,
              bus_seat_id: ticket.bus_seat_id,
              price: ticket.price,
              status: ticket.status
            }
          });
        })
      );
      
      // Create passenger records separately
      for (const ticket of tickets) {
        await tx.$queryRaw`
          INSERT INTO passenger_lists (
            schedule_id, 
            full_name, 
            document_id, 
            seat_number, 
            status
          ) VALUES (
            ${ticket.schedule_id},
            ${ticket.customerData.fullName},
            ${ticket.customerData.documentId},
            ${ticket.customerData.seatNumber},
            'confirmed'
          )
        `;
      }
      
      return ticketsCreated;
    });
    
    return NextResponse.json(createdTickets);
  } catch (error) {
    console.error("Error creating tickets:", error);
    return NextResponse.json(
      { error: "Error creating tickets", details: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}

export async function GET() {
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