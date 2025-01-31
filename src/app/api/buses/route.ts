import { NextResponse } from "next/server";
import { db } from "@/db";
import { buses, companies, busTypeTemplates, busSeats, seatStatusEnum } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createBusSchema } from "@/types/bus.types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busId = searchParams.get("busId");

    if (busId) {
      // First get the bus seats
      const seats = await db
        .select()
        .from(busSeats)
        .where(eq(busSeats.busId, busId));

      // Then get the bus with all its relations
      const [bus] = await db
        .select({
          id: buses.id,
          plateNumber: buses.plateNumber,
          templateId: buses.templateId,
          isActive: buses.isActive,
          maintenanceStatus: buses.maintenanceStatus,
          companyId: buses.companyId,
          seatMatrix: buses.seatMatrix,
          createdAt: buses.createdAt,
          updatedAt: buses.updatedAt,
          company: {
            id: companies.id,
            name: companies.name,
            active: companies.active,
            createdAt: companies.createdAt,
            updatedAt: companies.updatedAt,
          },
          template: {
            id: busTypeTemplates.id,
            name: busTypeTemplates.name,
            description: busTypeTemplates.description,
            totalCapacity: busTypeTemplates.totalCapacity,
            seatTemplateMatrix: busTypeTemplates.seatTemplateMatrix,
            isActive: busTypeTemplates.isActive,
          },
        })
        .from(buses)
        .leftJoin(companies, eq(buses.companyId, companies.id))
        .leftJoin(busTypeTemplates, eq(buses.templateId, busTypeTemplates.id))
        .where(eq(buses.id, busId))
        .limit(1);

      if (!bus) {
        return NextResponse.json(
          { error: "Bus no encontrado" },
          { status: 404 }
        );
      }

      // Combine the bus data with its seats
      return NextResponse.json({ ...bus, seats });
    }

    const results = await db
      .select({
        id: buses.id,
        plateNumber: buses.plateNumber,
        templateId: buses.templateId,
        isActive: buses.isActive,
        maintenanceStatus: buses.maintenanceStatus,
        companyId: buses.companyId,
        seatMatrix: buses.seatMatrix,
        createdAt: buses.createdAt,
        updatedAt: buses.updatedAt,
        company: {
          id: companies.id,
          name: companies.name,
          active: companies.active,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
        },
        template: {
          id: busTypeTemplates.id,
          name: busTypeTemplates.name,
          description: busTypeTemplates.description,
          totalCapacity: busTypeTemplates.totalCapacity,
          seatTemplateMatrix: busTypeTemplates.seatTemplateMatrix,
          isActive: busTypeTemplates.isActive,
        },
      })
      .from(buses)
      .leftJoin(companies, eq(buses.companyId, companies.id))
      .leftJoin(busTypeTemplates, eq(buses.templateId, busTypeTemplates.id))
      .where(eq(buses.isActive, true));

    return NextResponse.json(results);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al obtener los buses";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const busData = createBusSchema.parse(body);

    // Get the template data
    const [template] = await db
      .select()
      .from(busTypeTemplates)
      .where(eq(busTypeTemplates.id, busData.templateId));

    if (!template) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      // Create the bus with the template's seat matrix
      const [bus] = await tx
        .insert(buses)
        .values({
          companyId: busData.companyId,
          templateId: busData.templateId,
          plateNumber: busData.plateNumber,
          maintenanceStatus: busData.maintenanceStatus || "active",
          isActive: true,
          seatMatrix: template.seatTemplateMatrix, // Use the template's seat matrix
        })
        .returning();

      // Create bus seats based on the template's seat configuration
      const seatMatrix = template.seatTemplateMatrix as {
        firstFloor: {
          seats: Array<{
            id: string;
            name: string;
            tierId: string;
          }>;
        };
        secondFloor?: {
          seats: Array<{
            id: string;
            name: string;
            tierId: string;
          }>;
        };
      };

      // Create seats for first floor
      const firstFloorSeats = seatMatrix.firstFloor.seats.map((seat) => ({
        busId: bus.id,
        seatNumber: seat.name,
        tierId: seat.tierId,
        status: seatStatusEnum.enumValues[0], // 'available'
        isActive: true,
      }));

      // Create seats for second floor if it exists
      const secondFloorSeats = seatMatrix.secondFloor
        ? seatMatrix.secondFloor.seats.map((seat) => ({
            busId: bus.id,
            seatNumber: seat.name,
            tierId: seat.tierId,
            status: seatStatusEnum.enumValues[0], // 'available'
            isActive: true,
          }))
        : [];

      // Insert all seats
      const allSeats = [...firstFloorSeats, ...secondFloorSeats];
      await tx.insert(busSeats).values(allSeats);

      return bus;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error inesperado al crear el bus" },
      { status: 500 }
    );
  }
} 