import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createBusSchema } from "@/types/bus.types";

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    // Validar el UUID si se proporciona
    if (companyId && !isValidUUID(companyId)) {
      return NextResponse.json(
        { error: "Invalid company ID format" },
        { status: 400 }
      );
    }

    const buses = await prisma.buses.findMany({
      where: {
        is_active: true,
        ...(companyId ? { company_id: companyId } : {}),
      },
      include: {
        companies: true,
        bus_type_templates: true,
        bus_seats: true,
      },
    });

    // Transform the data to match the expected format
    const transformedBuses = buses.map(bus => ({
      id: bus.id,
      plateNumber: bus.plate_number,
      companyId: bus.company_id,
      templateId: bus.template_id,
      maintenanceStatus: bus.maintenance_status_enum,
      isActive: bus.is_active,
      seatMatrix: bus.seat_matrix,
      createdAt: bus.created_at,
      updatedAt: bus.updated_at,
      company: bus.companies ? {
        id: bus.companies.id,
        name: bus.companies.name,
        active: bus.companies.active,
      } : null,
      template: bus.bus_type_templates ? {
        id: bus.bus_type_templates.id,
        name: bus.bus_type_templates.name,
        type: bus.bus_type_templates.type,
        totalCapacity: bus.bus_type_templates.total_capacity,
        seatsLayout: bus.bus_type_templates.seats_layout,
      } : null,
      seats: bus.bus_seats.map(seat => ({
        id: seat.id,
        seatNumber: seat.seat_number,
        status: seat.status,
      })),
    }));

    return NextResponse.json(transformedBuses);
  } catch (error) {
    console.error("Error fetching buses:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Error fetching buses", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createBusSchema.parse(body);

    // Check if company exists
    const company = await prisma.companies.findUnique({
      where: {
        id: validatedData.companyId,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if template exists
    const template = await prisma.bus_type_templates.findUnique({
      where: {
        id: validatedData.templateId,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Bus template not found" },
        { status: 404 }
      );
    }

    // Create bus
    const bus = await prisma.buses.create({
      data: {
        company_id: validatedData.companyId,
        template_id: validatedData.templateId,
        plate_number: validatedData.plateNumber,
        maintenance_status_enum: validatedData.maintenanceStatus,
        is_active: true,
        seat_matrix: template.seat_template_matrix as Prisma.InputJsonValue,
      },
      include: {
        companies: true,
        bus_type_templates: true,
      },
    });

    return NextResponse.json(bus);
  } catch (error) {
    console.error("Error creating bus:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error creating bus" },
      { status: 500 }
    );
  }
} 