import { NextResponse } from "next/server";
import { db } from "@/db";
import { busTypeTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await db.query.busTypeTemplates.findFirst({
      where: eq(busTypeTemplates.id, id),
      with: {
        company: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching bus template:", error);
    return NextResponse.json(
      { error: "Error al obtener la plantilla" },
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

    // Check if template exists
    const existingTemplate = await db
      .select()
      .from(busTypeTemplates)
      .where(eq(busTypeTemplates.id, id))
      .limit(1);

    if (!existingTemplate.length) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    // Update template
    const [updatedTemplate] = await db
      .update(busTypeTemplates)
      .set({
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(busTypeTemplates.id, id))
      .returning();

    return NextResponse.json(updatedTemplate);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar la plantilla";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 