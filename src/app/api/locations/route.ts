import { NextResponse } from "next/server";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { z } from "zod";

const createLocationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export async function GET() {
  try {
    const allLocations = await db.select().from(locations);
    return NextResponse.json(allLocations);
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

    const [location] = await db
      .insert(locations)
      .values({
        name: validatedData.name,
      })
      .returning();

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { error: "Error al crear ubicación" },
      { status: 500 }
    );
  }
} 