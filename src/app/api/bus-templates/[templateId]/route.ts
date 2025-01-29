import { NextResponse } from "next/server";
import { db } from "@/db";
import { busTypeTemplates } from "@/db/schema";
import { updateBusTypeTemplateSchema } from "@/types/bus.types";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const template = await db.query.busTypeTemplates.findFirst({
      where: eq(busTypeTemplates.id, params.templateId),
      with: {
        company: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Bus template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching bus template:", error);
    return NextResponse.json(
      { error: "Failed to fetch bus template" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateBusTypeTemplateSchema.parse(body);

    const template = await db
      .update(busTypeTemplates)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(busTypeTemplates.id, params.templateId))
      .returning();

    if (!template.length) {
      return NextResponse.json(
        { error: "Bus template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template[0]);
  } catch (error) {
    console.error("Error updating bus template:", error);
    return NextResponse.json(
      { error: "Failed to update bus template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const template = await db
      .update(busTypeTemplates)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(busTypeTemplates.id, params.templateId))
      .returning();

    if (!template.length) {
      return NextResponse.json(
        { error: "Bus template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template[0]);
  } catch (error) {
    console.error("Error deleting bus template:", error);
    return NextResponse.json(
      { error: "Failed to delete bus template" },
      { status: 500 }
    );
  }
} 