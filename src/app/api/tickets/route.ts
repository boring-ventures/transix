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
    
    const createdTickets = await prismaClient.$transaction(
      tickets.map((ticket: any) =>
        prismaClient.tickets.create({
          data: ticket
        })
      )
    );

    return NextResponse.json(createdTickets);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error creating tickets", details: error.message },
      { status: 500 }
    );
  }
} 