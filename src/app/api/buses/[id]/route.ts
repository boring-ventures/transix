import { NextResponse } from "next/server";
import { db } from "@/db";
import { buses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateBusSchema } from "@/types/bus.types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bus = await db.query.buses.findFirst({
      where: eq(buses.id, id),
      with: {
        company: true,
        template: true,
      },
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(bus);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const busData = updateBusSchema.parse(body);

    // Check if bus exists
    const existingBus = await db
      .select()
      .from(buses)
      .where(eq(buses.id, id))
      .limit(1);

    if (!existingBus.length) {
      return NextResponse.json(
        { error: "Bus no encontrado" },
        { status: 404 }
      );
    }

    // Update bus
    const [updatedBus] = await db
      .update(buses)
      .set({
        ...busData,
        updatedAt: new Date(),
      })
      .where(eq(buses.id, id))
      .returning();

    return NextResponse.json(updatedBus);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar el bus";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if bus exists
    const existingBus = await db
      .select()
      .from(buses)
      .where(eq(buses.id, id))
      .limit(1);

    if (!existingBus.length) {
      return NextResponse.json(
        { error: "Bus no encontrado" },
        { status: 404 }
      );
    }

    // Instead of deleting, update the active status to false
    const [updatedBus] = await db
      .update(buses)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(buses.id, id))
      .returning();

    return NextResponse.json(updatedBus);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al desactivar el bus";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 