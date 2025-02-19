import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBusTypeTemplateSchema } from "@/types/bus.types";
import { ZodError } from "zod";

export async function GET() {
  try {
    const templates = await prisma.bus_type_templates.findMany({
      where: {
        is_active: true,
      },
      include: {
        companies: true,
      },
    });

    // Transform the response to match the expected format
    const transformedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      companyId: template.company_id,
      totalCapacity: template.total_capacity,
      type: template.type,
      seatTemplateMatrix: template.seat_template_matrix,
      seatsLayout: template.seats_layout,
      isActive: template.is_active,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      company: template.companies ? {
        id: template.companies.id,
        name: template.companies.name,
        active: template.companies.active,
      } : null,
    }));

    return NextResponse.json(transformedTemplates);
  } catch (error) {
    console.error("Error fetching bus type templates:", error);
    return NextResponse.json(
      { error: "Error fetching bus type templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createBusTypeTemplateSchema.parse(body);

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

    // Create bus type template
    const template = await prisma.bus_type_templates.create({
      data: {
        company_id: validatedData.companyId,
        name: validatedData.name,
        description: validatedData.description,
        total_capacity: validatedData.totalCapacity,
        type: validatedData.type,
        seat_template_matrix: validatedData.seatTemplateMatrix,
        seats_layout: validatedData.seatsLayout,
        is_active: true,
      },
      include: {
        companies: true,
      },
    });

    // Transform the response to match the expected format
    const transformedTemplate = {
      id: template.id,
      name: template.name,
      description: template.description,
      companyId: template.company_id,
      totalCapacity: template.total_capacity,
      type: template.type,
      seatTemplateMatrix: template.seat_template_matrix,
      seatsLayout: template.seats_layout,
      isActive: template.is_active,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      company: template.companies ? {
        id: template.companies.id,
        name: template.companies.name,
        active: template.companies.active,
      } : null,
    };

    return NextResponse.json(transformedTemplate);
  } catch (error) {
    console.error("Error creating bus type template:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error creating bus type template" },
      { status: 500 }
    );
  }
} 