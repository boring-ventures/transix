import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDriverSchema, updateDriverSchema } from "@/types/driver.types";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");

    const drivers = await prisma.drivers.findMany({
      where: {
        ...(companyId ? { company_id: companyId } : {}),
        active: true,
      },
      orderBy: { created_at: "desc" },
    });

    const formattedDrivers = drivers.map((driver) => ({
      id: driver.id,
      fullName: driver.full_name,
      documentId: driver.document_id,
      licenseNumber: driver.license_number,
      licenseCategory: driver.license_category,
      active: driver.active,
      companyId: driver.company_id,
      createdAt: driver.created_at,
      updatedAt: driver.updated_at,
    }));

    return NextResponse.json(formattedDrivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { error: "Error al obtener conductores" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createDriverSchema.parse(body);

    const driver = await prisma.drivers.create({
      data: {
        full_name: validatedData.fullName,
        document_id: validatedData.licenseNumber,
        license_number: validatedData.licenseNumber,
        license_category: validatedData.licenseCategory,
        company_id: validatedData.companyId,
        active: true,
      },
    });

    return NextResponse.json({
      id: driver.id,
      fullName: driver.full_name,
      documentId: driver.document_id,
      licenseNumber: driver.license_number,
      licenseCategory: driver.license_category,
      active: driver.active,
      companyId: driver.company_id,
      createdAt: driver.created_at,
      updatedAt: driver.updated_at,
    });
  } catch (error) {
    console.error("Error creating driver:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos de conductor inválidos", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Ya existe un conductor con ese número de licencia" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al crear el conductor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere el ID del conductor" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateDriverSchema.parse(body);

    const driver = await prisma.drivers.update({
      where: { id },
      data: {
        full_name: validatedData.fullName,
        document_id: validatedData.licenseNumber,
        license_number: validatedData.licenseNumber,
        license_category: validatedData.licenseCategory,
        company_id: validatedData.companyId,
        active: validatedData.active,
      },
    });

    return NextResponse.json({
      id: driver.id,
      fullName: driver.full_name,
      documentId: driver.document_id,
      licenseNumber: driver.license_number,
      licenseCategory: driver.license_category,
      active: driver.active,
      companyId: driver.company_id,
      createdAt: driver.created_at,
      updatedAt: driver.updated_at,
    });
  } catch (error) {
    console.error("Error updating driver:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos de conductor inválidos", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Conductor no encontrado" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al actualizar el conductor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere el ID del conductor" },
        { status: 400 }
      );
    }

    const driver = await prisma.drivers.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({
      id: driver.id,
      fullName: driver.full_name,
      documentId: driver.document_id,
      licenseNumber: driver.license_number,
      licenseCategory: driver.license_category,
      active: driver.active,
      companyId: driver.company_id,
      createdAt: driver.created_at,
      updatedAt: driver.updated_at,
    });
  } catch (error) {
    console.error("Error deleting driver:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Conductor no encontrado" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al eliminar el conductor" },
      { status: 500 }
    );
  }
} 