import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTicketSchema.parse(body);

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or find customer
      let customer = validatedData.customerId 
        ? await tx.customers.findUnique({ where: { id: validatedData.customerId } })
        : await tx.customers.findUnique({ 
            where: { document_id: validatedData.customerData.documentId } 
          });

      if (!customer) {
        customer = await tx.customers.create({
          data: {
            full_name: validatedData.customerData.fullName,
            document_id: validatedData.customerData.documentId,
            phone: validatedData.customerData.phone,
            email: validatedData.customerData.email,
          },
        });
      }

      // Update seat status
      await tx.bus_seats.update({
        where: { id: validatedData.busSeatId },
        data: { status: "maintenance" }, // Use appropriate status
      });

      // Create ticket
      const ticket = await tx.tickets.create({
        data: {
          schedule_id: validatedData.scheduleId,
          customer_id: customer.id,
          bus_seat_id: validatedData.busSeatId,
          price: validatedData.price,
          notes: validatedData.notes,
          status: "active",
        },
        include: {
          customers: true,
          bus_seats: {
            include: {
              seat_tiers: true,
            },
          },
          schedules: true,
        },
      });

      return { ticket, customer };
    });

    // Transform response
    const transformedTicket = {
      id: result.ticket.id,
      scheduleId: result.ticket.schedule_id,
      customerId: result.ticket.customer_id,
      busSeatId: result.ticket.bus_seat_id,
      status: result.ticket.status,
      price: result.ticket.price,
      createdAt: result.ticket.created_at,
      updatedAt: result.ticket.updated_at,
      customer: {
        id: result.customer.id,
        fullName: result.customer.full_name,
        documentId: result.customer.document_id,
        phone: result.customer.phone,
        email: result.customer.email,
      },
      seat: result.ticket.bus_seats ? {
        id: result.ticket.bus_seats.id,
        seatNumber: result.ticket.bus_seats.seat_number,
        status: result.ticket.bus_seats.status,
        tier: result.ticket.bus_seats.seat_tiers ? {
          id: result.ticket.bus_seats.seat_tiers.id,
          name: result.ticket.bus_seats.seat_tiers.name,
          basePrice: result.ticket.bus_seats.seat_tiers.base_price,
        } : null,
      } : null,
    };

    return NextResponse.json(transformedTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Error al crear el ticket" },
      { status: 500 }
    );
  }
} 