import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBusTypeTemplateSchema } from "@/types/bus.types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await prisma.bus_type_templates.findUnique({
      where: {
        id,
      },
      include: {
        companies: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Bus type template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching bus type template:", error);
    return NextResponse.json(
      { error: "Error fetching bus type template" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateBusTypeTemplateSchema.parse(body);

    // Check if template exists
    const existingTemplate = await prisma.bus_type_templates.findUnique({
      where: {
        id,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Bus type template not found" },
        { status: 404 }
      );
    }

    // Update template
    const updatedTemplate = await prisma.bus_type_templates.update({
      where: {
        id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating bus type template:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error updating bus type template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if template exists
    const existingTemplate = await prisma.bus_type_templates.findUnique({
      where: {
        id,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Bus type template not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    const deletedTemplate = await prisma.bus_type_templates.update({
      where: {
        id,
      },
      data: {
        is_active: false,
      },
    });

    return NextResponse.json(deletedTemplate);
  } catch (error) {
    console.error("Error deleting bus type template:", error);
    return NextResponse.json(
      { error: "Error deleting bus type template" },
      { status: 500 }
    );
  }
} 