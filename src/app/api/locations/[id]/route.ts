import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateLocationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const location = await prisma.locations.findUnique({
      where: { id }
    });

    if (!location) {
      return NextResponse.json(
        { error: "Ubicación no encontrada" },
        { status: 404 }
      );
    }

    // Transform the response to match the expected format
    const transformedLocation = {
      id: location.id,
      name: location.name,
      createdAt: location.created_at,
      updatedAt: location.updated_at,
    };

    return NextResponse.json(transformedLocation);
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { error: "Error al obtener la ubicación" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const locationData = updateLocationSchema.parse(body);

    // Check if location exists
    const existingLocation = await prisma.locations.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return NextResponse.json(
        { error: "Ubicación no encontrada" },
        { status: 404 }
      );
    }

    // Update location
    const updatedLocation = await prisma.locations.update({
      where: { id },
      data: {
        name: locationData.name,
        updated_at: new Date(),
      },
    });

    // Transform the response to match the expected format
    const transformedLocation = {
      id: updatedLocation.id,
      name: updatedLocation.name,
      createdAt: updatedLocation.created_at,
      updatedAt: updatedLocation.updated_at,
    };

    return NextResponse.json(transformedLocation);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar la ubicación";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if location exists
    const existingLocation = await prisma.locations.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return NextResponse.json(
        { error: "Ubicación no encontrada" },
        { status: 404 }
      );
    }

    // Check for dependencies before deleting
    const dependencies = await prisma.$transaction([
      prisma.routes.count({
        where: {
          OR: [
            { origin_id: id },
            { destination_id: id }
          ]
        }
      }),
      prisma.bus_logs.count({
        where: { location_id: id }
      })
    ]);

    const [routesCount, busLogsCount] = dependencies;

    if (routesCount > 0 || busLogsCount > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar la ubicación porque tiene dependencias",
          details: {
            message: "La ubicación tiene registros relacionados que impiden su eliminación",
            dependencies: {
              routes: routesCount > 0,
              busLogs: busLogsCount > 0
            }
          }
        },
        { status: 400 }
      );
    }

    // If no dependencies, proceed with deletion
    await prisma.locations.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Ubicación eliminada exitosamente"
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al eliminar la ubicación";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 