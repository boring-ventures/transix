import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createLocationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export async function GET() {
  try {
    const locations = await prisma.locations.findMany();
    
    // Transform the data to match the expected format
    const transformedLocations = locations.map(location => ({
      id: location.id,
      name: location.name,
      createdAt: location.created_at,
      updatedAt: location.updated_at,
    }));
    
    return NextResponse.json(transformedLocations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Error al obtener ubicaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createLocationSchema.parse(body);

    const location = await prisma.locations.create({
      data: {
        name: validatedData.name,
      },
    });

    // Transform the response to match the expected format
    const transformedLocation = {
      id: location.id,
      name: location.name,
      createdAt: location.created_at,
      updatedAt: location.updated_at,
    };

    return NextResponse.json(transformedLocation, { status: 201 });
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { error: "Error al crear ubicación" },
      { status: 500 }
    );
  }
} 