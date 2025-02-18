import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBusSchema } from "@/types/bus.types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const bus = await prisma.buses.findUnique({
      where: { id },
      include: {
        companies: true,
        bus_type_templates: true,
      },
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus no encontrado" },
        { status: 404 }
      );
    }

    // Transform the response to match the expected format
    const transformedBus = {
      id: bus.id,
      plateNumber: bus.plate_number,
      templateId: bus.template_id,
      isActive: bus.is_active,
      maintenanceStatus: bus.maintenance_status_enum,
      companyId: bus.company_id,
      createdAt: bus.created_at,
      updatedAt: bus.updated_at,
      company: bus.companies ? {
        id: bus.companies.id,
        name: bus.companies.name,
        active: bus.companies.active,
        createdAt: bus.companies.created_at,
        updatedAt: bus.companies.updated_at,
      } : undefined,
      template: bus.bus_type_templates ? {
        id: bus.bus_type_templates.id,
        name: bus.bus_type_templates.name,
        type: bus.bus_type_templates.type,
      } : undefined,
    };

    return NextResponse.json(transformedBus);
  } catch (error) {
    console.error("Error fetching bus:", error);
    return NextResponse.json(
      { error: "Error al obtener el bus" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const busData = updateBusSchema.parse(body);

    // Check if bus exists
    const existingBus = await prisma.buses.findUnique({
      where: { id }
    });

    if (!existingBus) {
      return NextResponse.json(
        { error: "Bus no encontrado" },
        { status: 404 }
      );
    }

    // Transform the input data to match Prisma schema
    const prismaData = {
      plate_number: busData.plateNumber,
      template_id: busData.templateId,
      is_active: busData.isActive,
      maintenance_status_enum: busData.maintenanceStatus,
      company_id: busData.companyId,
      updated_at: new Date(),
    };

    // Update bus
    const updatedBus = await prisma.buses.update({
      where: { id },
      data: prismaData,
      include: {
        companies: true,
        bus_type_templates: true,
      },
    });

    // Transform the response to match the expected format
    const transformedBus = {
      id: updatedBus.id,
      plateNumber: updatedBus.plate_number,
      templateId: updatedBus.template_id,
      isActive: updatedBus.is_active,
      maintenanceStatus: updatedBus.maintenance_status_enum,
      companyId: updatedBus.company_id,
      createdAt: updatedBus.created_at,
      updatedAt: updatedBus.updated_at,
      company: updatedBus.companies ? {
        id: updatedBus.companies.id,
        name: updatedBus.companies.name,
        active: updatedBus.companies.active,
        createdAt: updatedBus.companies.created_at,
        updatedAt: updatedBus.companies.updated_at,
      } : undefined,
      template: updatedBus.bus_type_templates ? {
        id: updatedBus.bus_type_templates.id,
        name: updatedBus.bus_type_templates.name,
        type: updatedBus.bus_type_templates.type,
      } : undefined,
    };

    return NextResponse.json(transformedBus);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar el bus";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if bus exists
    const existingBus = await prisma.buses.findUnique({
      where: { id }
    });

    if (!existingBus) {
      return NextResponse.json(
        { error: "Bus no encontrado" },
        { status: 404 }
      );
    }

    // Instead of deleting, update the active status to false
    const updatedBus = await prisma.buses.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
      include: {
        companies: true,
        bus_type_templates: true,
      },
    });

    // Transform the response to match the expected format
    const transformedBus = {
      id: updatedBus.id,
      plateNumber: updatedBus.plate_number,
      templateId: updatedBus.template_id,
      isActive: updatedBus.is_active,
      maintenanceStatus: updatedBus.maintenance_status_enum,
      companyId: updatedBus.company_id,
      createdAt: updatedBus.created_at,
      updatedAt: updatedBus.updated_at,
      company: updatedBus.companies ? {
        id: updatedBus.companies.id,
        name: updatedBus.companies.name,
        active: updatedBus.companies.active,
        createdAt: updatedBus.companies.created_at,
        updatedAt: updatedBus.companies.updated_at,
      } : undefined,
      template: updatedBus.bus_type_templates ? {
        id: updatedBus.bus_type_templates.id,
        name: updatedBus.bus_type_templates.name,
        type: updatedBus.bus_type_templates.type,
      } : undefined,
    };

    return NextResponse.json(transformedBus);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al desactivar el bus";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 