import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCompanySchema } from "@/types/company.types";

export async function GET() {
  try {
    const companies = await prisma.companies.findMany();
    
    // Transform the data to match the expected format
    const transformedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      active: company.active,
      createdAt: company.created_at,
      updatedAt: company.updated_at,
    }));
    
    return NextResponse.json(transformedCompanies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Error al obtener las empresas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    const company = await prisma.companies.create({
      data: {
        name: validatedData.name,
        active: validatedData.active,
      },
    });

    // Transform the response to match the expected format
    const transformedCompany = {
      id: company.id,
      name: company.name,
      active: company.active,
      createdAt: company.created_at,
      updatedAt: company.updated_at,
    };

    return NextResponse.json(transformedCompany, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Error al crear la empresa" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const companyId = body.companyId;
    if (!companyId) {
      return NextResponse.json(
        { error: "ID de empresa requerido" },
        { status: 400 }
      );
    }

    const validatedData = createCompanySchema.parse(body.data);

    const company = await prisma.companies.update({
      where: { id: companyId },
      data: {
        name: validatedData.name,
        active: validatedData.active,
      },
    });

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
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Error al actualizar la empresa" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    if (!companyId) {
      return NextResponse.json(
        { error: "ID de empresa requerido" },
        { status: 400 }
      );
    }

    // Instead of deleting, we'll update the active status to false
    const company = await prisma.companies.update({
      where: { id: companyId },
      data: { active: false },
    });

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
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Error al eliminar la empresa" },
      { status: 500 }
    );
  }
}