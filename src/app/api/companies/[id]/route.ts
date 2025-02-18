import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCompanySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  active: z.boolean().default(true),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const company = await prisma.companies.findUnique({
      where: { id }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    // Transform the response to match the expected format
    const transformedCompany = {
      id: company.id,
      name: company.name,
      active: company.active,
      createdAt: company.created_at,
      updatedAt: company.updated_at,
    };

    return NextResponse.json(transformedCompany);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Error al obtener la empresa" },
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
    const companyData = updateCompanySchema.parse(body);

    // Check if company exists
    const existingCompany = await prisma.companies.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    // Update company
    const updatedCompany = await prisma.companies.update({
      where: { id },
      data: {
        name: companyData.name,
        active: companyData.active,
        updated_at: new Date(),
      },
    });

    // Transform the response to match the expected format
    const transformedCompany = {
      id: updatedCompany.id,
      name: updatedCompany.name,
      active: updatedCompany.active,
      createdAt: updatedCompany.created_at,
      updatedAt: updatedCompany.updated_at,
    };

    return NextResponse.json(transformedCompany);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar la empresa";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if company exists
    const existingCompany = await prisma.companies.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    // Check for dependencies before soft deleting
    const dependencies = await prisma.$transaction([
      prisma.buses.count({
        where: { company_id: id }
      }),
      prisma.profiles.count({
        where: { company_id: id }
      }),
      prisma.branches.count({
        where: { company_id: id }
      }),
      prisma.bus_type_templates.count({
        where: { company_id: id }
      }),
      prisma.seat_tiers.count({
        where: { company_id: id }
      })
    ]);

    const [busesCount, profilesCount, branchesCount, templatesCount, tiersCount] = dependencies;

    if (busesCount > 0 || profilesCount > 0 || branchesCount > 0 || templatesCount > 0 || tiersCount > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar la empresa porque tiene dependencias",
          details: {
            message: "La empresa tiene registros relacionados que impiden su eliminación",
            dependencies: {
              buses: busesCount > 0,
              profiles: profilesCount > 0,
              branches: branchesCount > 0,
              templates: templatesCount > 0,
              tiers: tiersCount > 0
            }
          }
        },
        { status: 400 }
      );
    }

    // Instead of hard deleting, update active status to false
    const updatedCompany = await prisma.companies.update({
      where: { id },
      data: {
        active: false,
        updated_at: new Date(),
      },
    });

    // Transform the response to match the expected format
    const transformedCompany = {
      id: updatedCompany.id,
      name: updatedCompany.name,
      active: updatedCompany.active,
      createdAt: updatedCompany.created_at,
      updatedAt: updatedCompany.updated_at,
    };

    return NextResponse.json(transformedCompany);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al desactivar la empresa";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 