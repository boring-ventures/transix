import { NextResponse } from "next/server";
import { db } from "@/db";
import { buses, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { insertBusSchema } from "@/types/bus.types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busId = searchParams.get("busId");

    if (busId) {
      const result = await db
        .select({
          id: buses.id,
          plateNumber: buses.plateNumber,
          busType: buses.busType,
          totalCapacity: buses.totalCapacity,
          isActive: buses.isActive,
          maintenanceStatus: buses.maintenanceStatus,
          companyId: buses.companyId,
          createdAt: buses.createdAt,
          updatedAt: buses.updatedAt,
          company: {
            id: companies.id,
            name: companies.name,
            active: companies.active,
            createdAt: companies.createdAt,
            updatedAt: companies.updatedAt,
          },
        })
        .from(buses)
        .leftJoin(companies, eq(buses.companyId, companies.id))
        .where(eq(buses.id, busId))
        .limit(1);

      if (!result.length) {
        return NextResponse.json(
          { error: "Bus no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(result[0]);
    }

    const results = await db
      .select({
        id: buses.id,
        plateNumber: buses.plateNumber,
        busType: buses.busType,
        totalCapacity: buses.totalCapacity,
        isActive: buses.isActive,
        maintenanceStatus: buses.maintenanceStatus,
        companyId: buses.companyId,
        createdAt: buses.createdAt,
        updatedAt: buses.updatedAt,
        company: {
          id: companies.id,
          name: companies.name,
          active: companies.active,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
        },
      })
      .from(buses)
      .leftJoin(companies, eq(buses.companyId, companies.id))
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
      const busData = insertBusSchema.parse(body);
      
      console.log(busData)

    const [bus] = await db
      .insert(buses)
      .values({
        companyId: busData.companyId,
        plateNumber: busData.plateNumber,
        busType: busData.busType,
        totalCapacity: busData.totalCapacity,
        maintenanceStatus: busData.maintenanceStatus || null,
        isActive: true,
      })
      .returning();

    return NextResponse.json(bus, { status: 201 });
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