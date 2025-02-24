import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTripSettlementSchema } from "@/types/trip.types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const settlement = await prisma.trip_settlements.findFirst({
      where: {
        schedule_id: scheduleId,
      },
      include: {
        schedules: {
          include: {
            routes: true,
          },
        },
      },
    });

    if (!settlement) {
      return NextResponse.json(
        { error: "Liquidación no encontrada" },
        { status: 404 }
      );
    }

    // Transformar los datos al formato esperado
    const transformedSettlement = {
      id: settlement.id,
      scheduleId: settlement.schedule_id,
      totalIncome: settlement.total_income,
      totalExpenses: settlement.total_expenses,
      netAmount: settlement.net_amount,
      status: settlement.status,
      details: settlement.details,
      settledAt: settlement.settled_at,
      createdAt: settlement.created_at,
      updatedAt: settlement.updated_at,
      schedule: settlement.schedules ? {
        id: settlement.schedules.id,
        routeId: settlement.schedules.route_id,
        departureDate: settlement.schedules.departure_date,
        estimatedArrivalTime: settlement.schedules.estimated_arrival_time,
        route: settlement.schedules.routes ? {
          id: settlement.schedules.routes.id,
          name: settlement.schedules.routes.name,
        } : null,
      } : null,
    };

    return NextResponse.json(transformedSettlement);
  } catch (error) {
    console.error("Error fetching settlement:", error);
    return NextResponse.json(
      { error: "Error al obtener la liquidación" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const body = await request.json();
    
    // Validar los datos de entrada
    const validationResult = createTripSettlementSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verificar que el viaje existe  
    const schedule = await prisma.schedules.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Viaje no encontrado" },
        { status: 404 }
      );
    }

    // Crear la liquidación
    const settlement = await prisma.trip_settlements.create({
      data: {
        schedule_id: scheduleId,
        total_income: data.totalIncome,
        total_expenses: data.totalExpenses,
        net_amount: data.totalIncome - data.totalExpenses,
        status: "pending",
        details: data.details,
      },
      include: {
        schedules: {
          include: {
            routes: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: settlement.id,
      scheduleId: settlement.schedule_id,
      totalIncome: settlement.total_income,
      totalExpenses: settlement.total_expenses,
      netAmount: settlement.net_amount,
      status: settlement.status,
      details: settlement.details,
      settledAt: settlement.settled_at,
      createdAt: settlement.created_at,
      updatedAt: settlement.updated_at,
      schedule: settlement.schedules ? {
        id: settlement.schedules.id,
        routeId: settlement.schedules.route_id,
        departureDate: settlement.schedules.departure_date,
        estimatedArrivalTime: settlement.schedules.estimated_arrival_time,
        route: settlement.schedules.routes ? {
          id: settlement.schedules.routes.id,
          name: settlement.schedules.routes.name,
        } : null,
      } : null,
    });
  } catch (error) {
    console.error("Error creating settlement:", error);
    return NextResponse.json(
      { error: "Error al crear la liquidación" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const body = await request.json();

    // Buscar la liquidación existente
    const existingSettlement = await prisma.trip_settlements.findFirst({
      where: {
        schedule_id: scheduleId,
      },
    });

    if (!existingSettlement) {
      return NextResponse.json(
        { error: "Liquidación no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar la liquidación
    const settlement = await prisma.trip_settlements.update({
      where: {
        id: existingSettlement.id,
      },
      data: {
        total_income: body.totalIncome,
        total_expenses: body.totalExpenses,
        net_amount: body.totalIncome - body.totalExpenses,
        details: body.details,
        status: body.status,
        ...(body.status === "settled" && { settled_at: new Date() }),
      },
      include: {
        schedules: {
          include: {
            routes: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: settlement.id,
      scheduleId: settlement.schedule_id,
      totalIncome: settlement.total_income,
      totalExpenses: settlement.total_expenses,
      netAmount: settlement.net_amount,
      status: settlement.status,
      details: settlement.details,
      settledAt: settlement.settled_at,
      createdAt: settlement.created_at,
      updatedAt: settlement.updated_at,
      schedule: settlement.schedules ? {
        id: settlement.schedules.id,
        routeId: settlement.schedules.route_id,
        departureDate: settlement.schedules.departure_date,
        estimatedArrivalTime: settlement.schedules.estimated_arrival_time,
        route: settlement.schedules.routes ? {
          id: settlement.schedules.routes.id,
          name: settlement.schedules.routes.name,
        } : null,
      } : null,
    });
  } catch (error) {
    console.error("Error updating settlement:", error);
    return NextResponse.json(
      { error: "Error al actualizar la liquidación" },
      { status: 500 }
    );
  }
} 