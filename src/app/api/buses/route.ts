import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createBusSchema } from "@/types/bus.types";

export async function GET() {
  try {
    const buses = await prisma.buses.findMany({
      where: {
        is_active: true,
      },
      include: {
        companies: true,
        bus_type_templates: true,
        bus_seats: true,
      },
    });

    return NextResponse.json(buses);
  } catch (error) {
    console.error("Error fetching buses:", error);
    return NextResponse.json(
      { error: "Error fetching buses" },
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